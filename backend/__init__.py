'''
__init__ file for the backend package
'''
from flask import Flask
from flask_cors import CORS

app = Flask(__name__)
cors = CORS(app)

from backend import routes