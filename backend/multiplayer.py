import random
import threading
import time
from datetime import datetime, timedelta
from flask_socketio import emit,join_room, leave_room
from backend import app, socketio
from flask import jsonify, request
from .neo4j_routes import _get_players, _get_scoring_data, _check_teammates

CLEANUP_INTERVAL = 600 # cleans rooms every 10 mins
ROOM_TIMEOUT = 300 # closes rooms after 5 minutes of 0 players
RUN_CLEANUP_THREAD = True

# TODO
# 1. Set settings to be in the database and accessible
# 2. Allow reconnections to get players too

room_db: dict[int, dict[str, list | datetime | dict | None]] = {} 
'''
Database schema:
{
    room_id: {
        'users': list[str], 
        'lastUsed': datetime,
        'players': [{
            'player_data': {
                'currPlayer': str,
                'lastPlayer': str,
                'currPlayerID': str,
                'lastPlayerID': str
            }, 
            'pictures': {
                'currPlayerURL': str,
                'lastPlayerURL': str
            },
            'players': list[str],
            'path': list[str]
        }, ...]
        'scores': {
            user: int, 
            ...
        }, 
        'settings': {
            'roundTime': int, 
            'roundNum': int, 
            'difficulty': str
        }, 
        'gameStatus': int # one of 0 (not started), -1 (game finished), or round number
        'finishedUsers': list[str] 
        'roundEnd': datetime
    }
}
'''

socket_to_user = {} #maps socket id to username

thread_lock = threading.Lock()

def clean_rooms():
    while RUN_CLEANUP_THREAD:

        time.sleep(CLEANUP_INTERVAL)
        
        with thread_lock:

            now = datetime.now()
            room_ids = list(room_db.keys())

            for room_id in room_ids:
                if now - room_db[room_id]['lastUsed'] > timedelta(seconds=ROOM_TIMEOUT) and not room_db[room_id]['users']:
                    del room_db[room_id]

                    print(f"Deleted room {room_id} due to inactivity.")

cleanup_thread = threading.Thread(target=clean_rooms, daemon=True)
cleanup_thread.start()

def generate_room_id(n):
    #n digit code, usually use n=6
    return random.randint(10**(n-1)+1, 10**(n))

def update_room_usage(room: int):
    with thread_lock:
        room_db[room]['lastUsed'] = datetime.now()

@app.route('/create_room', methods=['POST'])
def create_room():
    room_id = generate_room_id(6)

    while room_id in room_db:
        room_id = generate_room_id(6)

    with thread_lock:
        room_db[room_id] = {
            'users': [], 
            'lastUsed': datetime.now(),
            'players': None, 
            'scores': {}, 
            'settings': {
                'roundTime': 75,
                'roundNum': 5, 
                'difficulty': 'easy'
            }, 
            'gameStatus': 0, 
            'finishedUsers': [], 
            'roundEnd': None
        }

    update_room_usage(room=room_id)
 
    return jsonify({"room_id": room_id})

@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print(request.sid)
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - user connected (ID: {request.sid})")

@socketio.on("disconnect")
def disconnected():
    """event listener when client disconnects to the server"""
    user_id = request.sid
    for room_id in room_db:
        if user_id in room_db[room_id]['users']:
            with thread_lock:
                room_db[room_id]['users'].remove(user_id)

            if user_id in socket_to_user:
                with thread_lock:
                    del socket_to_user[user_id]

            update_room_usage(room=room_id)
            socketio.emit(
                'leave', 
                {
                    "user_count": len(room_db[room_id]['users']), 
                    "users" : room_db[room_id]['users'], 
                    "user_map" : {socket_id: socket_to_user[socket_id] for socket_id in room_db[room_id]['users']}
                },
                room=room_id
            )
            break
    print(f"{datetime.now().strftime('%Y-%m-%d %H:%M:%S')} - user disconnected (ID: {request.sid})")

@socketio.on('message')
def handle_message(data):
    """event listener when client types a message"""
    room_id = data['room_id']

    if room_id in room_db:
        emit("message", {'data': data['message'], 'id': request.sid}, room=room_id)


@socketio.on('user_joined') #when a user joins, emit username from the backend
def on_join(data):
    room_id = int(data['room_id'])

    if room_id in room_db:
        join_room(room_id)
        with thread_lock:
            room_db[room_id]['users'].append(request.sid)
        update_room_usage(room=room_id)
        socket_to_user[request.sid] = data['username']
        socketio.emit('join_success', {"room_id": room_id, "user_count": len(room_db[room_id]['users'])}, room=request.sid)
        emit_data = {
            "user_count": len(room_db[room_id]['users']), 
            "users" : room_db[room_id]['users'], 
            "user_map" : {socket_id: socket_to_user[socket_id] for socket_id in room_db[room_id]['users']},
            "difficulty" : 'easy',
            "roundTime" : 75,
            "roundNum" : 5
        }
        if 'settings' in room_db[room_id]:
            settings = room_db[room_id]['settings']
            emit_data["difficulty"] = settings['difficulty']
            emit_data["roundTime"] = settings['roundTime']
            emit_data["roundNum"] = settings['roundNum']
        
        socketio.emit(
            'user_joined', 
            emit_data,
            room=room_id
        )
    else:
        socketio.emit('error', {"message": "Room not found"}, room=request.sid)

@socketio.on('user_finished')
def user_finished(data):
    room_id = int(data['room_id'])

    if room_id in room_db:
        socketio.emit('user_finished', data, room=room_id)
        with thread_lock:
            room_db[room_id]['finishedUsers'].append(data['id'])

@socketio.on('start_new_round')
def start_new_round(data):
    room_id = int(data['room_id'])
    if room_id in room_db:
        with thread_lock:
            room_db[room_id]['gameStatus'] += 1
            room_db[room_id]['finishedUsers'] = [] # reset
            room_db[room_id]['roundEnd'] = datetime.now() + timedelta(seconds=room_db[room_id]['settings']['roundTime'])
        socketio.emit('start_new_round', {'roundEnd': room_db[room_id]['roundEnd'].timestamp()}, room=room_id)


@socketio.on('lobby_rejoined')
def lobby_rejoined(data):
    room_id = int(data['room_id'])
    if room_id in room_db:
        socketio.emit('lobby_rejoined', data, room=room_id)

@socketio.on('leave')
def on_leave(data):
    room_id = int(data['room_id'])
    if room_id in room_db and request.sid in room_db[room_id]['users']:
        leave_room(room_id)
        with thread_lock:
            room_db[room_id]['users'].remove(request.sid)
        update_room_usage(room=room_id)

        socketio.emit(
            'leave', 
            {
                "user_count": len(room_db[room_id]['users']), 
                "users" : room_db[room_id]['users'], 
                "user_map" : {socket_id: socket_to_user[socket_id] for socket_id in room_db[room_id]['users']}
            },
            room=room_id
        )
        del socket_to_user[request.sid]

@socketio.on('settings_changed')
def handle_difficulty_change(data):
    room_id, difficulty, roundTime, roundNum = data['room_id'], data['difficulty'], data['roundTime'], data['roundNum']
    if room_id in room_db:
        with thread_lock:
            room_db[room_id]['settings'] = {'difficulty' : difficulty, 'roundTime' : roundTime, 'roundNum': roundNum}
        socketio.emit('settings_changed', room_db[room_id]['settings'], room=room_id)

@socketio.on("start_game")
def start_game(data):
    num_rounds = int(data['rounds'])
    room_id = int(data['room_id'])
    difficulty = data['difficulty']
    socketio.emit('show_loading', room=room_id)

    if room_id in room_db:
        ppr = []
        for _ in range(num_rounds):
            p = _get_players(difficulty)
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
            room_db[room_id]['players'] = ppr
            room_db[room_id]['gameStatus'] = 1
            room_db[room_id]['finishedUsers'] = []
            room_db[room_id]['roundEnd'] = datetime.now() + timedelta(seconds=room_db[room_id]['settings']['roundTime'])
            room_db[room_id]['scores'] = {user: 0 for user in room_db[room_id]['users']}
    socketio.emit('start_game', {"players" : room_db[room_id]['players'], "roundEnd": room_db[room_id]['roundEnd'].timestamp()}, room=room_id)

@socketio.on("submit_score")
def submit_score(data):
    room_id = int(data['room_id'])
    user = data['user']
    path = data['path']
    guesses_used = int(data['guessesUsed'])
    print(path)
    finished = len(path) > 2 and _check_teammates(path[-1], path[-2])['areTeammates']
    if room_id not in room_db:
        return
    score = 0
    for i in range(1, len(path)):
        guess_data = _get_scoring_data(path[i - 1], path[i])
        gPlayed = guess_data['Weight']
        relevancy = guess_data['Relevancy']
        score += (((0.7 * (1584 - gPlayed)/ 1584) + (0.3 * (9.622 - relevancy) / 9.622)) * 100)/((guesses_used+1)**(1.5))
    if finished:
        score += 70*(6 - guesses_used)
    

    with thread_lock:
        room_db[room_id]['scores'][user] = room_db[room_id]['scores'].get(user, 0) + int(score)
    socketio.emit('user_score', {'score': room_db[room_id]['scores'][user]}, room=request.sid)
    print("room scores are", room_db[room_id]['scores'])
    if len(room_db[room_id]['finishedUsers']) == len(room_db[room_id]['users']):
        socketio.emit('scores_added', room_db[room_id]['scores'], room=room_id)
        socketio.emit('new_round_at', {'time': (datetime.now() + timedelta(seconds=10)).timestamp()}, room=room_id)