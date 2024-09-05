'''
__init__ file for the backend package
'''
from flask import Flask
from flask_socketio import SocketIO,emit
from flask_cors import CORS 

app = Flask(__name__)
app.config['SECRET_KEY'] = 'secret!'
CORS(app,resources={r"/*":{"origins":"http://localhost:5173"}})
socketio = SocketIO(app,cors_allowed_origins="http://localhost:5173")


if __name__ == '__main__':
    socketio.run(app, debug=True,port=5000)
from backend import routes
from backend import websocket