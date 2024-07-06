'''
__init__ file for the backend package
'''
from flask import Flask

app = Flask(__name__)

from backend import routes