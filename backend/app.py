from flask import Flask, request, jsonify, send_file
from pymongo import MongoClient, DESCENDING
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime
import gridfs
from bson import ObjectId
import io

app = Flask(__name__)
CORS(app, supports_credentials=True)  # Enables CORS for all domains with credentials
bcrypt = Bcrypt(app)

# MongoDB Connection
client = MongoClient("mongodb+srv://ziling:GanXie1999@orbital.p2xujzb.mongodb.net/?retryWrites=true&w=majority&appName=Orbital")
db = client["merchmates"]
users = db["users"]
trade_listings = db["trade_listings"]
fs = gridfs.GridFS(db)

# Save a new user profile
@app.route("/save-username", methods=["POST"])
def save_username():
    data = request.form
    user_id = data.get("id")
    username = data.get("username")
    profilePic = request.files.get("profilePicture")
    description = data.get("description", "")
    location = data.get("location", "")

    if not user_id or not username:
        return jsonify({"message": "Missing fields"}), 400

    if users.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 409

    image_id = None
    if profilePic:
        image_id = fs.put(profilePic, filename=profilePic.filename, content_type=profilePic.content_type)

    users.insert_one({
        "id": user_id,
        "username": username,
        "profilePictureId": image_id,
        "description": description,
        "location": location
    })

    return jsonify({"message": "User registered successfully"}), 201

# Get a user's public profile
@app.route("/get-profile", methods=["POST"])
def get_profile():
    data = request.json
    user_id = data.get("id")
    user = users.find_one({"id": user_id})

    if not user:
        return jsonify({"message": "User not found"}), 404

    profile = {
        "username": user.get("username"),
        "description": user.get("description", ""),
        "location": user.get("location", ""),
        "profilePicture": f"/image/{user['profilePictureId']}" if "profilePictureId" in user else None
    }

    return jsonify(profile), 200

# Get username only (legacy endpoint)
@app.route("/get-username", methods=["POST"])
def get_username():
    data = request.json
    user_id = data.get("id")
    user = users.find_one({"id": user_id})
    if not user:
        return jsonify({"message": "User not found"}), 404
    return jsonify({"username": user["username"]}), 200

# Get image by GridFS ID
@app.route("/image/<id>", methods=["GET"])
def get_image(id):
    try:
        image = fs.get(ObjectId(id))
        return send_file(io.BytesIO(image.read()), mimetype=image.content_type)
    except:
        return jsonify({"message": "Image not found"}), 404

# Search listings
@app.route("/search-listings", methods=["GET"])
def search_listings():
    query = request.args.get("keyword", "").strip()
    if not query:
        return jsonify([]), 200

    search_filter = {
        "$or": [
            {"have": {"$regex": query, "$options": "i"}},
            {"want": {"$regex": query, "$options": "i"}}
        ]
    }

    listings = list(trade_listings.find(search_filter).sort("created_at", DESCENDING).limit(20))
    for listing in listings:
        listing["_id"] = str(listing["_id"])
        listing["image_url"] = f"/image/{listing['haveImageId']}"
        listing["haveImageId"] = str(listing["haveImageId"])

    return jsonify(listings), 200

# Get all recent listings
@app.route("/get-listings", methods=["GET"])
def get_listings():
    listings = list(trade_listings.find().sort("created_at", DESCENDING).limit(20))
    for listing in listings:
        listing["_id"] = str(listing["_id"])
        listing["image_url"] = f"/image/{listing['haveImageId']}"
        listing["haveImageId"] = str(listing["haveImageId"])
    return jsonify(listings), 200

# Add a listing
@app.route("/add-listings", methods=["POST"])
def add_listings():
    data = request.form
    have = data.get("have")
    haveImage = request.files.get("haveImage")
    want = data.get("want")
    preferences = data.get("preferences")
    user_id = data.get("id")
    user = users.find_one({"id": user_id})

    if not user:
        return jsonify({"message": "Error: User not found, please login first"}), 401

    if not have or not haveImage:
        return jsonify({"message": "Missing required listing data"}), 400

    image_id = fs.put(haveImage, filename=haveImage.filename, content_type=haveImage.content_type)

    trade_listings.insert_one({
        "have": have,
        "haveImageId": image_id,
        "want": want,
        "preferences": preferences,
        "id": user_id,
        "created_at": datetime.now()
    })

    return jsonify({"message": "Listing added successfully"}), 201

if __name__ == "__main__":
    app.run(debug=True)
