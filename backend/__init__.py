'''
__init__ file for the backend package
'''
from flask import Flask
from flask_socketio import SocketIO
from flask_cors import CORS

app = Flask(__name__, static_folder='../react-frontend/dist', static_url_path="/")
CORS(app, origins=['https://hoopsh2h.sv2projects.com'])
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app, cors_allowed_origins='*')
from backend import multiplayer
from backend import neo4j_routes
