from flask import Flask
from flask_socketio import SocketIO, emit

app = Flask(__name__)
app.config['SECRET_KEY'] = "\x12\xc5:\xdbQ\x9ey\xf9\xfb~\x04\xb8\x92/-\n-\xc6\x98\xc8\x01dU\xe"
socketio = SocketIO(app)

# WebSocket event handlers
@socketio.on('connect')
def handle_connect():
    print('Client connected')

@socketio.on('disconnect')
def handle_disconnect():
    print('Client disconnected')

@socketio.on('message')
def handle_message(data):
    print('Received message: ' + data)
    emit('response', 'Server received: ' + data)

if __name__ == '__main__':
    socketio.run(app)