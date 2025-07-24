from operator import itemgetter
import re
from flask import Flask, render_template, request, jsonify, send_file
from pymongo import MongoClient, DESCENDING
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime
import gridfs
from bson import ObjectId
import io
import os

app = Flask(__name__, template_folder = "./templates")
CORS(app)
bcrypt = Bcrypt(app)

mongo_url = os.environ.get("MONGODB_URI")
client = MongoClient(mongo_url)
db = client["merchmates"] # Creates "merchmates" database
users = db["users"] # Creates "users" collection within "merchmates" database
trade_listings = db["trade_listings"]
ongoing_trades = db["ongoing_trades"]
notifications = db["notifications"]
completed_trades = db["completed_trades"]
reviews = db["reviews"]
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
    users.insert_one({
        "id": user_id, 
        "username": username, 
        "profilePictureId": image_id, 
        "description": description, 
        "location": location,
        "created_at": datetime.now()})
    return jsonify({"message": "User registered succesfully"}), 201 # Return message & 201 Created response

@app.route("/get-profile", methods = ["POST"])
def get_profile():
    data = request.json
    user_id = data["id"]

    if not user_id:
        return jsonify({"error": "User ID is required"}), 400

    user = users.find_one({"id": user_id})

    if not user:
        return jsonify({"error": "User not found"}), 404

    user["_id"] = str(user["_id"])
    user["image_url"] = f'/image/{str(user["profilePictureId"])}'
    user["profilePictureId"] = str(user["profilePictureId"])

    return jsonify(user), 200

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
        search_filter["user_id"] = user_id
    elif exclude_user_id:
        search_filter["user_id"] = {"$ne": exclude_user_id}

    listings = list(trade_listings.find(search_filter).sort("created_at", DESCENDING))
    for listing in listings:
        listing["_id"] = str(listing["_id"])
        listing["image_url"] = f'/image/{str(listing["haveImageId"])}'
        listing["haveImageId"] = str(listing["haveImageId"])
    return jsonify(listings), 200

@app.route("/get-listings", methods = ["GET"])
def get_listings():
    user_id = request.args.get("id")
    exclude_user_id = request.args.get("excludeId")
    query = {}

    if user_id:
        query["user_id"] = user_id
    elif exclude_user_id:
        query["user_id"] = {"$ne": exclude_user_id}

    listings = list(trade_listings.find(query).sort("created_at", DESCENDING))
    for listing in listings:
        listing["_id"] = str(listing["_id"])
        listing["image_url"] = f'/image/{str(listing["haveImageId"])}'
        listing["haveImageId"] = str(listing["haveImageId"])
    return jsonify(listings), 200

@app.route("/get-completed-trades-number", methods = ["GET"])
def get_completed_trades():
    user_id = request.args.get("id")
    query = {"$or": [{"userA_id": user_id}, {"userB_id": user_id}]}
    count = completed_trades.count_documents(query)
    return jsonify({"count": count}), 200

@app.route("/trade-history", methods = ["GET"])
def get_trade_history():
    user_id = request.args.get("id")
    query = {"$or": [{"userA_id": user_id}, {"userB_id": user_id}]}

    trade_history = list(completed_trades.find(query).sort("created_at", DESCENDING))
    for trade in trade_history:
        trade["_id"] = str(trade["_id"])
        trade["image_url"] = f'/image/{str(trade["haveImageId"])}'
        trade["haveImageId"] = str(trade["haveImageId"])

        if trade["userA_id"] == user_id:
            other_user = users.find_one({"id": trade["userB_id"]})
            own_item = trade["userA_have"]
            other_item = trade["userB_have"]
        else:
            other_user = users.find_one({"id": trade["userA_id"]})
            own_item = trade["userB_have"]
            other_item = trade["userA_have"]
        
        trade["other_user"] = other_user["username"]
        trade["own_item"] = own_item
        trade["other_item"] = other_item

    return jsonify(trade_history), 200

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
    
    trade_listings.insert_one({
        "have": have, 
        "haveImageId": image_id, 
        "want": want, 
        "preferences": preferences, 
        "user_id": user["id"], 
        "created_at": datetime.now()})

    return jsonify({"message": "Listing added successfully"}), 201

@app.route("/start-trade", methods = ["POST"])
def start_trade():
    data = request.json
    listing_id = data.get("listingId")
    user_id = data.get("userId")

    if not listing_id or not user_id:
        return jsonify({"message": "Missing fields"}), 400

    listing = trade_listings.find_one({"_id": ObjectId(listing_id)})

    if not listing:
        return jsonify({"message": "Listing not found"}), 404

    user = users.find_one({"id": user_id})

    if not user:
        return jsonify({"message": "User not found, please login first"}), 401

    result = ongoing_trades.insert_one({
        "userA_id": user_id, 
        "userB_id": listing["user_id"], 
        "userB_have": listing["have"], 
        "userA_have": listing["want"], 
        "userA_status": "Agreed", 
        "userB_status": "Pending", 
        "preferences": listing["preferences"], 
        "haveImageId": listing["haveImageId"], 
        "created_at": datetime.now()})
    
    notifications.insert_one({
        "recipient_id": listing["user_id"], 
        "message": f"{user["username"]} has started a trade with you for {listing["have"]}", 
        "trade_id": str(result.inserted_id), 
        "sender_username": user["username"],
        "created_at": datetime.now(), 
        "read": False})

    trade_listings.delete_one({"_id": ObjectId(listing_id)})
    
    return jsonify({"message": "Trade started successfully", "trade_id": str(result.inserted_id)}), 201

@app.route("/trade/<trade_id>", methods = ["GET"])
def trade(trade_id):
    trade = ongoing_trades.find_one({"_id": ObjectId(trade_id)})
    
    if not trade:
        trade = completed_trades.find_one({"_id": ObjectId(trade_id)})

    if not trade:
        return jsonify({"message": "Trade not found"}), 404

    userA = users.find_one({"id": trade["userA_id"]})
    userB = users.find_one({"id": trade["userB_id"]})

    if not userA or not userB:
        return jsonify({"message": "User not found"}), 404

    trade["_id"] = str(trade["_id"])
    trade["userA"] = {"id": userA["id"], "username": userA["username"]}
    trade["userB"] = {"id": userB["id"], "username": userB["username"]}
    trade["haveImageId"] = str(trade["haveImageId"])
    
    return jsonify(trade), 200

@app.route("/update-trade-status", methods = ["POST"])
def update_trade_status():
    data = request.json
    trade_id = data.get("tradeId")
    user_id = data.get("user_id")
    status = data.get("status")

    if not trade_id or not user_id or not status:
        return jsonify({"message": "Missing fields"}), 400

    trade = ongoing_trades.find_one({"_id": ObjectId(trade_id)})

    if not trade:
        return jsonify({"message": "Trade not found"}), 404

    if trade["userA_id"] != user_id and trade["userB_id"] != user_id:
        return jsonify({"message": "User not part of this trade"}), 403

    sender = users.find_one({"id": user_id})

    if trade["userA_id"] == user_id:
        ongoing_trades.update_one({"_id": ObjectId(trade_id)}, {"$set": {"userA_status": status}})
        recipient_id = trade["userB_id"]
    else:
        ongoing_trades.update_one({"_id": ObjectId(trade_id)}, {"$set": {"userB_status": status}})
        recipient_id = trade["userA_id"]

    notifications.insert_one({
        "recipient_id": recipient_id, 
        "message": f"{sender['username']} updated the trade status to {status}", 
        "trade_id": trade_id, 
        "sender_username": sender["username"], 
        "created_at": datetime.now(), 
        "read": False})
    
    updated_trade = ongoing_trades.find_one({"_id": ObjectId(trade_id)})

    if trade["userA_id"] == user_id and status == "Completed":
        if updated_trade["userB_status"] == "Completed":
            completed_trades.insert_one(updated_trade)
            ongoing_trades.delete_one({"_id": ObjectId(trade_id)})
    elif trade["userB_id"] == user_id and status == "Completed":
        if updated_trade["userA_status"] == "Completed":
            completed_trades.insert_one(updated_trade)
            ongoing_trades.delete_one({"_id": ObjectId(trade_id)})
    
    return jsonify({"message": "Trade status updated successfully"}), 200

@app.route("/reject-trade", methods = ["POST"])
def reject_trade():
    data = request.json
    trade_id = data.get("tradeId")

    to_delete = ongoing_trades.find_one({"_id": ObjectId(trade_id)})

    trade_listings.insert_one({
        "have": to_delete["userB_have"], 
        "haveImageId": to_delete["haveImageId"],
        "want": to_delete["userA_have"], 
        "preferences": to_delete["preferences"], 
        "user_id": to_delete["userB_id"], 
        "created_at": datetime.now()})
    
    result = ongoing_trades.delete_one({"_id": ObjectId(trade_id)})

    if result.deleted_count == 0:
        return jsonify({"message": "Trade not found"}), 404
    else:
        return jsonify({"message": "Trade deleted successfully"}), 200

@app.route("/notifications", methods = ["GET"])
def get_notifications():
    user_id = request.args.get("userId")

    if not user_id:
        return jsonify({"message": "User ID is required"}), 400

    notifications_list = list(notifications.find({"recipient_id": user_id, "read": False}).sort("created_at", DESCENDING))
    
    for notification in notifications_list:
        notification["_id"] = str(notification["_id"])
        notification["created_at"] = notification["created_at"].strftime("%Y-%m-%d %H:%M:%S")
    
    return jsonify(notifications_list), 200

@app.route("/notifications-history", methods = ["GET"])
def get_notifications_history():
    user_id = request.args.get("userId")
    
    if not user_id:
        return jsonify({"message": "User ID is required"}), 400
    
    notifications_list = list(notifications.find({"recipient_id": user_id}).sort("created_at", DESCENDING))
    
    for notification in notifications_list:
        notification["_id"] = str(notification["_id"])
        notification["created_at"] = notification["created_at"].strftime("%Y-%m-%d %H:%M:%S")
    
    return jsonify(notifications_list), 200

@app.route("/mark-notification-read", methods = ["POST"])
def mark_notification_read():
    data = request.json
    notification_id = data.get("notificationId")
    
    if not notification_id:
        return jsonify({"message": "Notification ID is required"}), 400
    
    result = notifications.update_one({"_id": ObjectId(notification_id)}, {"$set": {"read": True}})
    
    if result.modified_count == 0:
        return jsonify({"message": "Notification not found or already read"}), 404
    else:
        return jsonify({"message": "Notification marked as read"}), 200

@app.route("/review", methods = ["POST"])
def review():
    data = request.form
    review = data.get("review")
    rating = data.get("rating")
    rating = int(float(rating))
    reviewer_id = data.get("reviewer_id")
    trade_id = data.get("trade_id")

    trade = completed_trades.find_one({"_id": ObjectId(trade_id)})
    reviewed_id = trade["userA_id"] if trade["userB_id"] == reviewer_id else trade["userB_id"]

    reviews.insert_one({
        "trade_id": trade_id,
        "reviewer_id": reviewer_id,
        "reviewed_id": reviewed_id,
        "rating": rating,
        "review": review,
        "created_at": datetime.now()})

    return jsonify({"message": "Review added successfully"}), 201

@app.route("/check-review", methods = ["POST"])
def check_review():
    data = request.json
    reviewer_id = data.get("reviewer_id")
    trade_id = data.get("trade_id")

    existing_review = reviews.find_one({
        "reviewer_id": reviewer_id, 
        "trade_id": trade_id})
    
    if existing_review:
        return jsonify({"already_reviewed": True}), 200
    else:
        return jsonify({"already_reviewed": False}), 200

@app.route("/get-average-rating", methods = ["GET"])
def get_average_rating():
    user_id = request.args.get("id")

    all_reviews = reviews.find({"reviewed_id": user_id})

    if not all_reviews:
        return jsonify({"average_rating": 0, "total_reviews": 0}), 200

    total_rating = sum(review["rating"] for review in all_reviews)
    total_reviews = all_reviews.count_documents()
    average_rating = total_rating / total_reviews if total_reviews > 0 else 0

    return jsonify({"average_rating": average_rating, "total_reviews": total_reviews}), 200

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)