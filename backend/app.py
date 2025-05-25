from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from datetime import datetime

app = Flask(__name__, template_folder = "./templates")
CORS(app)
bcrypt = Bcrypt(app)

client = MongoClient("mongodb+srv://ziling:GanXie1999@orbital.p2xujzb.mongodb.net/?retryWrites=true&w=majority&appName=Orbital")
db = client["merchmates"] # Creates "merchmates" database
users = db["users"] # Creates "users" collection within "merchmates" database
trade_listings = db["trade_listings"]

@app.route("/save-username", methods = ["POST"])
def save_username():
    data = request.json # Gets JSON body sent from frontend
    user_id = data["id"]
    username = data["username"]

    if not user_id or not username:
        return jsonify({"message": "Missing fields"}), 400

    if users.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 409 # Return message & 409 Conflict error

    users.insert_one({"id": user_id, "username": username})
    return jsonify({"message": "User registered succesfully"}), 201 # Return message & 201 Created response

@app.route("/get-listings", methods = ["GET"])
def get_listings():
    listings = list(trade_listings.find({}, {"_id": 0})).sort("created_at", DESCENDING).limit(20)
    return jsonify(listings), 200

@app.route("/add-listings", methods = ["POST"])
def add_listings():
    data = request.json
    have = data["have"]
    want = data["want"]
    preferences = data["preferences"]
    user_id = data["id"]
    user = users.find_one({"id": user_id})

    if not user:
        return jsonify({"message": "Error: User not found, please login first"}), 401 # Unauthorized

    trade_listings.insert_one({"have": have, "want": want, "preferences": preferences, "username": user["username"], "created_at": datetime.now()})
    return jsonify({"message": "Listing added successfully"}), 201

if __name__ == "__main__":
    app.run()

"""
To run, go to command prompt, go to the directory with this file, then install flask using:
pip install flask
Then, run this file using:
python app.py

then go to cd frontend
npm install
npm install react-router-dom
npm install @supabase/supabase-js
npm start
"""
