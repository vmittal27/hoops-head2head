'''
__init__ file for the backend package
'''
from flask import Flask
from flask_socketio import SocketIO

app = Flask(__name__, static_folder='../react-frontend/dist', static_url_path="/")
app.config['SECRET_KEY'] = 'secret!'
socketio = SocketIO(app)
from backend import multiplayer
from backend import neo4j_routes

if __name__ == '__main__':
    socketio.run(app, debug=True, port=3000)
