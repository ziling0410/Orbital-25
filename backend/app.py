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

@app.route("/register", methods = ["POST"])
def register():
    data = request.json # Gets JSON body sent from frontend
    username = data["username"]
    password = data["password"]

    if users.find_one({"username": username}):
        return jsonify({"message": "Username already exists"}), 409 # Return message & 409 Conflict error

    hashed_password = bcrypt.generate_password_hash(password).decode("utf-8") # Encrypt the password so that it isn't stored as plain text
    # generate_password_hash() returns a bytes object -> decode() used

    users.insert_one({"username": username, "password": hashed_password})
    return jsonify({"message": "User registered succesfully"}), 201 # Return message & 201 Created response

@app.route("/login", methods = ["POST"])
def login():
    data = request.json
    username = data["username"]
    password = data["password"]
    user = users.find_one({"username": username})
    if user and bcrypt.check_password_hash(user["password"], password):
        return jsonify({"message": "Login successful"}), 200 # Return message & 200 OK
    return jsonify({"message": "Username doesn't exist or wrong password"}), 401 # Return message & 401 Unauthorized error

if __name__ == "__main__":
    app.run()

"""
To run, go to command prompt, go to the directory with this file, then install flask using:
pip install flask
Then, run this file using:
python app.py

then go to cd frontend
npm install react-router-dom
npm start
"""
