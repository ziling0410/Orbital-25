from flask import Flask, render_template, request, jsonify
from pymongo import MongoClient
from flask_cors import CORS
from flask_bcrypt import Bcrypt

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
    listings = list(users.find({}))
    for listing in listings:
        listing["_id"] = str(listing["_id"])
    return jsonify(listings)

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
