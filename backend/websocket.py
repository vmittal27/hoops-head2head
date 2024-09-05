import random
from flask_socketio import emit,join_room, leave_room
from backend import app, socketio
from flask import jsonify, request
from .routes import get_players


rooms = {} 
game_states = {}
room_players = {} 

@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print(request.sid)
    print("client has connected")

@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    user_id = request.sid
    for room in rooms:
        if user_id in rooms[room]:
            rooms[room].remove(user_id)
            socketio.emit('player_left', {"player_count": len(rooms[room]), "players" : rooms[room]}, room=room)
            if rooms[room] == []:
                del rooms[room]
            break
    print("user disconnected")

@socketio.on('message')
def handle_message(data):
    """event listener when client types a message"""
    room_id = data['room_id']

    if room_id in rooms:
        emit("message", {'data': data['message'], 'id': request.sid}, room=room_id)

def generate_room_id(n):
    #n digit code, usually use n=6
    return random.randint(10**(n-1)+1, 10**(n))
    
@app.route('/create_room', methods=['POST'])
def create_room():
    room_id = generate_room_id(6)
    while room_id in rooms:
        room_id = generate_room_id(6)
    rooms[room_id] = []
    print(rooms)
    return jsonify({"room_id": room_id})

@socketio.on('player_joined')
def on_join(data):
    room_id = int(data['room_id'])
    # print(room_id, rooms, int(room_id) in [key for key in rooms.keys()])
    if room_id in rooms:
        join_room(room_id)
        rooms[room_id].append(request.sid)
        socketio.emit('join_success', {"room_id": room_id, "player_count": len(rooms[room_id])}, room=request.sid)
        socketio.emit('player_joined', {"player_count": len(rooms[room_id]), "players" : rooms[room_id]}, room=room_id)
        print(rooms)
    else:
        socketio.emit('error', {"message": "Room not found"}, room=request.sid)

@socketio.on('player_finished')
def player_finished(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('player_finished_endpoint', data, room=room_id)

@socketio.on('new_round_start')
def new_round_start(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('start_new_round', data, room=room_id )

@socketio.on('lobby_rejoin')
def lobby_rejoin(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('rejoin_lobby', data, room=room_id)

@socketio.on('leave')
def on_leave(data):
    room_id = int(data['room_id'])
    if room_id in rooms and request.sid in rooms[room_id]:
        leave_room(room_id)
        rooms[room_id].remove(request.sid)
        socketio.emit('player_left', {"player_count": len(rooms[room_id]), "players" : rooms[room_id]}, room=room_id)
        if len(rooms[room_id]) == 0:
            del rooms[room_id]

@socketio.on('settings_changed')
def handle_difficulty_change(data):
    room_id, difficulty, roundTime, roundNum = data['room_id'], data['difficulty'], data['roundTime'], data['roundNum']
    if room_id in rooms:
        socketio.emit('change_settings', {'difficulty' : difficulty, 'roundTime' : roundTime, 'roundNum': roundNum}, room=room_id)
    # Broadcast the difficulty change to all players in the room

@socketio.on("start_game")
def start_game(data):
    num_rounds = int(data['rounds'])
    room_id = int(data['room_id'])
    difficulty = data['difficulty']
    if room_id in rooms:
        ppr = []
        for i in range(num_rounds):
            p = get_players(difficulty)
            new_round = {'player_data': {'currPlayer': p["Player 1"]["name"], 'lastPlayer': p["Player 2"]["name"], 'currPlayerID': p["Player 1"]["id"], 'lastPlayerID': p["Player 2"]["id"]}, 
                         'pictures': {'currPlayerURL': p["Player 1"]["picture_url"], 'lastPlayerURL': p["Player 2"]["picture_url"]},
                         'players': [p["Player 1"]["name"]], 'path': p['Path']}
            ppr.append(new_round)
        room_players[room_id] = ppr
    print("BIG TEST", room_players[room_id])
    socketio.emit('game_started', {"players" : room_players[room_id]}, room=room_id)

@socketio.on("data_load")
def load_data(data):
    room_id = int(data['room_id'])
    print(data)
    if room_id in rooms:
        socketio.emit('load_data', {'data' : data['player_data'], 'pictures' : data['pictures'], 'players' : data['players'], 'path' : data['path']}, room=room_id)

@socketio.on("time_change")
def time_change(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('change_time', {'newTime' : data['time']}, room=room_id)

@socketio.on("sending_score")
def score_send(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('score_added', {'player_id' : data['player_id'], 'score' : data['score']}, room=room_id)

@socketio.on("transition_time")
def transition_time(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit('transition_time_changed', {'newTime' : data['time']}, room=room_id)