import re
from flask import Flask, render_template, request, jsonify, send_file
from pymongo import MongoClient, DESCENDING
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime
import gridfs
from bson import ObjectId
import io

app = Flask(__name__, template_folder = "./templates")
CORS(app)
bcrypt = Bcrypt(app)

client = MongoClient("mongodb+srv://ziling:GanXie1999@orbital.p2xujzb.mongodb.net/?retryWrites=true&w=majority&appName=Orbital")
db = client["merchmates"] # Creates "merchmates" database
users = db["users"] # Creates "users" collection within "merchmates" database
trade_listings = db["trade_listings"]
fs = gridfs.GridFS(db)

@app.route("/save-username", methods = ["POST"])
def save_username():
    data = request.form
    user_id = data["id"]
    username = data["username"]
    profilePic = request.files.get("profilePicture")
    description = data["description"]
    location = data["location"]

    if not user_id or not username:
        return jsonify({"message": "Missing fields"}), 400

    if users.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 409 # Return message & 409 Conflict error

    image_id = fs.put(profilePic, filename = profilePic.filename, content_type = profilePic.content_type)
    users.insert_one({"id": user_id, "username": username, "profilePictureId": image_id, "description": description, "location": location})
    return jsonify({"message": "User registered succesfully"}), 201 # Return message & 201 Created response

@app.route("/get-username", methods = ["POST"])
def get_username():
    data = request.json
    user_id = data["id"]
    print(user_id)

    user = users.find_one({"id": user_id})
    return jsonify({"username": user["username"]}), 200

@app.route("/image/<id>", methods = ["GET"])
def get_image(id):
    image = fs.get(ObjectId(id))
    return send_file(io.BytesIO(image.read()), mimetype = image.content_type)

@app.route("/search-listings", methods = ["GET"])
def search_listings():
    query = request.args.get("keyword", "").strip()
    user_id = request.args.get("id")
    exclude_user_id = request.args.get("excludeId")

    if not query:
        return jsonify([]), 200

    search_filter = {
        "$or": [
            {"have": {"$regex": query, "$options": "i"}},
            {"want": {"$regex": query, "$options": "i"}}
        ]
    }

    if user_id:
        search_filter["id"] = user_id
    elif exclude_user_id:
        search_filter["id"] = {"$ne": exclude_user_id}

    listings = list(trade_listings.find(search_filter, {"_id": 0}).sort("created_at", DESCENDING))
    for listing in listings:
        listing["image_url"] = f'/image/{str(listing["haveImageId"])}'
        listing["haveImageId"] = str(listing["haveImageId"])
    return jsonify(listings), 200

@app.route("/get-listings", methods = ["GET"])
def get_listings():
    user_id = request.args.get("id")
    exclude_user_id = request.args.get("excludeId")
    query = {}

    if user_id:
        query["id"] = user_id
    elif exclude_user_id:
        query["id"] = {"$ne": exclude_user_id}

    listings = list(trade_listings.find(query, {"_id": 0}).sort("created_at", DESCENDING))
    for listing in listings:
        listing["image_url"] = f'/image/{str(listing["haveImageId"])}'
        listing["haveImageId"] = str(listing["haveImageId"])
    return jsonify(listings), 200

@app.route("/add-listings", methods = ["POST"])
def add_listings():
    data = request.form
    have = data.get("have")
    haveImage = request.files.get("haveImage")
    want = data.get("want")
    preferences = data.get("preferences")
    user_id = data.get("id")
    user = users.find_one({"id": user_id})

    if not user:
        return jsonify({"message": "User not found, please login first"}), 401 # Unauthorized

    image_id = fs.put(haveImage, filename = haveImage.filename, content_type = haveImage.content_type)
    
    trade_listings.insert_one({"have": have, "haveImageId": image_id, "want": want, "preferences": preferences, "id": user["id"], "created_at": datetime.now()})
    return jsonify({"message": "Listing added successfully"}), 201

if __name__ == "__main__":
    app.run()