import random
import threading
import time
from datetime import datetime, timedelta
from flask_socketio import emit,join_room, leave_room
from backend import app, socketio
from flask import jsonify, request
from .neo4j_routes import get_players

CLEANUP_INTERVAL = 600 # cleans rooms every 10 mins
ROOM_TIMEOUT = 300 # closes rooms after 5 minutes of 0 players
RUN_CLEANUP_THREAD = True

rooms = {} # contains data about the users in each room
room_players = {} # contains data about the basketball players assigned to each room
socket_to_user = {} #maps socket id to username
rooms_usage_tracker: dict[int, datetime] = {} # keeps track of room usage

thread_lock = threading.Lock()

def clean_rooms():
    while RUN_CLEANUP_THREAD:

        time.sleep(CLEANUP_INTERVAL)
        
        with thread_lock:

            now = datetime.now()
            room_ids = list(rooms_usage_tracker.keys())

            for room_id in room_ids:

                if now - rooms_usage_tracker[room_id] > timedelta(seconds=ROOM_TIMEOUT) and not rooms[room_id]:

                    del rooms_usage_tracker[room_id]
                    del rooms[room_id]

                    if room_id in room_players:
                        del room_players[room_id]

                    print(f"Deleted room {room_id} due to inactivity.")

cleanup_thread = threading.Thread(target=clean_rooms, daemon=True)
cleanup_thread.start()

def generate_room_id(n):
    #n digit code, usually use n=6
    return random.randint(10**(n-1)+1, 10**(n))

def update_room_usage(room: int):
    with thread_lock:
        rooms_usage_tracker[room] = datetime.now()
    # print(rooms_usage_tracker)

@app.route('/create_room', methods=['POST'])
def create_room():
    room_id = generate_room_id(6)

    while room_id in rooms:
        room_id = generate_room_id(6)

    with thread_lock:
        rooms[room_id] = []
    update_room_usage(room=room_id)
 
    return jsonify({"room_id": room_id})

@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print(request.sid)
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - user connected (ID: {request.sid})")
    # print(f'\tRooms: {rooms}')
    # print(f'\tSocket-User Mapping: {socket_to_user}')
    # print(socket_to_user)

@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    user_id = request.sid
    for room_id in rooms:
        if user_id in rooms[room_id]:
            with thread_lock:
                rooms[room_id].remove(user_id)
            if user_id in socket_to_user:
                with thread_lock:
                    del socket_to_user[user_id]
            update_room_usage(room=room_id)
            socketio.emit('player_left', {"player_count": len(rooms[room_id]), "players" : rooms[room_id]}, room=room_id)
            break
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - user disconnected (ID: {request.sid})")
    # print(f'\tRooms: {rooms}')
    # print(f'\tSocket-User Mapping: {socket_to_user}')

@socketio.on('message')
def handle_message(data):
    """event listener when client types a message"""
    room_id = data['room_id']

    if room_id in rooms:
        emit("message", {'data': data['message'], 'id': request.sid}, room=room_id)


@socketio.on('user_joined') #when a user joins, emit username from the backend
def on_join(data):
    room_id = int(data['room_id'])

    if room_id in rooms:
        join_room(room_id)
        with thread_lock:
            rooms[room_id].append(request.sid)
        update_room_usage(room=room_id)
        socket_to_user[request.sid] = data['username']
        socketio.emit('join_success', {"room_id": room_id, "user_count": len(rooms[room_id])}, room=request.sid)
        socketio.emit('user_joined', {"user_count": len(rooms[room_id]), "users" : rooms[room_id], "user_map" : {socket_id: socket_to_user[socket_id] for socket_id in rooms[room_id]}}, room=room_id)
    else:
        socketio.emit('error', {"message": "Room not found"}, room=request.sid)

@socketio.on('user_finished')
def user_finished(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('user_finished', data, room=room_id)

@socketio.on('start_new_round')
def start_new_round(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('start_new_round', data, room=room_id )

@socketio.on('lobby_rejoined')
def lobby_rejoined(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('lobby_rejoined', data, room=room_id)

@socketio.on('leave')
def on_leave(data):
    room_id = int(data['room_id'])
    if room_id in rooms and request.sid in rooms[room_id]:
        leave_room(room_id)
        with thread_lock:
            rooms[room_id].remove(request.sid)
        update_room_usage(room=room_id)

        socketio.emit('leave', {"user_count": len(rooms[room_id]), "users" : rooms[room_id], "user_map" : {socket_id: socket_to_user[socket_id] for socket_id in rooms[room_id]}}, room=room_id)
        del socket_to_user[request.sid]

@socketio.on('settings_changed')
def handle_difficulty_change(data):
    room_id, difficulty, roundTime, roundNum = data['room_id'], data['difficulty'], data['roundTime'], data['roundNum']
    if room_id in rooms:
        socketio.emit('settings_changed', {'difficulty' : difficulty, 'roundTime' : roundTime, 'roundNum': roundNum}, room=room_id)

@socketio.on("start_game")
def start_game(data):
    num_rounds = int(data['rounds'])
    room_id = int(data['room_id'])
    difficulty = data['difficulty']

    if room_id in rooms:
        ppr = []
        for _ in range(num_rounds):
            p = get_players(difficulty)
            new_round = {
                'player_data': {
                    'currPlayer': p["Player 1"]["name"],
                    'lastPlayer': p["Player 2"]["name"],
                    'currPlayerID': p["Player 1"]["id"],
                    'lastPlayerID': p["Player 2"]["id"]
                }, 
                'pictures': {
                    'currPlayerURL': p["Player 1"]["picture_url"],
                    'lastPlayerURL': p["Player 2"]["picture_url"]
                },
                'players': [p["Player 1"]["name"]],
                'path': p['Path']
            }
            ppr.append(new_round)
        with thread_lock:
            room_players[room_id] = ppr
    socketio.emit('start_game', {"players" : room_players[room_id]}, room=room_id)

@socketio.on("time_changed")
def time_changed(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('time_changed', {'newTime' : data['time']}, room=room_id)

@socketio.on("score_added")
def score_send(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('score_added', {'player_id' : data['player_id'], 'score' : data['score']}, room=room_id)

@socketio.on("transition_time_changed")
def transition_time(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('transition_time_changed', {'newTime' : data['time']}, room=room_id)