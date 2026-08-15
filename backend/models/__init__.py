from flask_pymongo import PyMongo

mongo = PyMongo()

def get_db():
    from flask import current_app
    return mongo.db