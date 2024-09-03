import logging
import random
from flask import jsonify, request
from flask_socketio import emit,join_room, leave_room
from flask_cors import CORS
from neo4j import GraphDatabase
from backend import app, socketio

def read_credentials(file):
    credentials = {}
    with open(file, 'r') as file:
        for line in file:
            key, value = line.strip().split('=')
            credentials[key] = value
    return credentials

cred = read_credentials('credentials.txt')
uri = cred['NEO4J_URI']
username = cred['NEO4J_USER']
password = cred['NEO4J_PASSWORD']

#Driver instance
driver = GraphDatabase.driver(uri, auth=(username, password))

def get_two_players(rel_min, rel_max, year_min, year_max):
    """
    Gets 2 random players based on relevancy and year criteria.
    """
    query = f"""
    MATCH (p1:Player), (p2:Player)
    WHERE 
        p1 <> p2 AND
        NOT EXISTS((p1)-[]-(p2)) AND
        p1.Relevancy >= {rel_min} AND p1.Relevancy <= {rel_max} AND p1.year >= {year_min} AND p1.year <= {year_max} AND
        p2.Relevancy >= {rel_min} AND p2.Relevancy <= {rel_max} AND p2.year >= {year_min} AND p2.year <= {year_max}
    WITH p1, p2 
    MATCH path = shortestPath((p1)-[*]-(p2))
    RETURN p1.name AS player1Name, p2.name AS player2Name, [node IN nodes(path) | node.name] AS pathNames
    ORDER BY rand()
    LIMIT 1
    """
    with driver.session() as session:
        result = session.run(query)
        all_info = [{
            'player1': record['player1Name'],
            'player2': record['player2Name'],
            'shortest_path': record['pathNames']
        } for record in result]
        return all_info
    
@app.route('/')
def welcome():
    """
    Default screen for the standard URL
    """
    return "Welcome to Hoops H2H!"


@app.route('/players/<difficulty>')
def get_players(difficulty):
    """
    Endpoint to get players based on difficulty level.
    """
    query = f"""
    MATCH (n:Player {{difficulty: "{difficulty}"}})
    WITH n
    ORDER BY rand()
    LIMIT 2
    RETURN n;
    """

    neighbors = True
    while neighbors:
        records, summary, keys = driver.execute_query(query)

        p1 = records[0].data()[keys[0]]
        p2 = records[1].data()[keys[0]]

        path = get_shortest_path(p1['id'], p2['id'])
        neighbors = len(path) == 2 # true if direct neighbors, false otherwise
    
    {"Player 1": p1, "Player 2": p2, "Path": path}
    return {"Player 1": p1, "Player 2": p2, "Path": path}

@app.route("/path/shortest")
def get_shortest_path(src_id: str, dst_id: str):
    records, summary, keys = driver.execute_query(
        f'''
        MATCH (src {{`id`: '{src_id}'}}), (dst {{`id`: '{dst_id}'}})
        MATCH p = ShortestPath((src)-[:PLAYED_WITH*]-(dst))
        RETURN [node IN nodes(p)]
        ''',
        database_="neo4j"
    )

    players = []

    for record, key in zip(records, keys):
        data = record.data()[key]
        for datum in data:
            players.append(datum['name'])
    
    return players

@app.route("/check", methods=['POST'])
def check_teammates():
    data = request.get_json()
    player1_id = data.get('player1_id')
    player2_id = data.get('player2_id')
    print(player1_id, player2_id)
    if not player1_id or not player2_id:
        return jsonify({'error': 'Missing player names'}), 400

    query = f"""
    MATCH (a {{`id`: "{player1_id}"}})--(b {{`id`: "{player2_id}"}})
    RETURN COUNT(*) > 0 AS areTeammates
    """
    with driver.session() as session:
        result = session.run(query)
        are_teammates = result.single()['areTeammates']
        return jsonify({'areTeammates': are_teammates})
    
@app.route("/autocomplete")
def autocomplete_players():
    search = request.args.get('search')
    if len(search) < 3:
        return {}
    query = f"""
    MATCH (n: Player)
    WHERE toLower(n.name) CONTAINS toLower("{search}")
    RETURN n.name as name, n.year as year, n.id as id
    LIMIT 7
    """

    with driver.session() as session:
        result = session.run(query)
        return {
            record['id']: [record['year'], record['name']] for record in result
        }
@app.route("/scoring", methods = ['POST'])
def get_scoring_data():
    data = request.get_json()
    player1_id = data.get('player1_id')
    player2_id = data.get('player2_id')
    if not player1_id or not player2_id:
        return jsonify({'error': 'Missing player names'}), 400

    query = f"""
    MATCH (p1 {{`id`: "{player1_id}"}}), (p2 {{`id`: "{player2_id}"}})
    MATCH (p1)-[r]-(p2)
    RETURN r.weight AS weight, p2.Relevancy AS relevancy
    """
    with driver.session() as session:
        result = session.run(query)
        record = result.single()
        logging.info('record')
        return {
            'Weight': record["weight"],
            'Relevancy' : record["relevancy"]
        }

@app.route("/player", methods = ['POST'])
def get_player_json_data():
    '''
    endpoint for getting player json data based on id
    '''
    data = request.get_json()
    player_id = data.get('player_id')
    if not player_id:
        return jsonify({'error' : 'Missing player id'}), 400
    
    query = """
    MATCH (n:Player {id: $player_id})
    RETURN n
    """
    with driver.session() as session:
        result = session.run(query, player_id=player_id)
        player_record = result.single()
        if player_record:
            player_node = player_record["n"]
            return jsonify({
                'name': player_node.get("name"),
                'id' : player_node.get("id"),
                'url': player_node.get("picture_url")
            })
        else:
            return jsonify({'error': 'Player not found'}), 404

@app.route("/http-call")
def http_call():
    """return JSON with string data as the value"""
    data = {'data':'This text was fetched using an HTTP call to server on render'}
    return jsonify(data)

@socketio.on("connect")
def connected():
    """event listener when client connects to the server"""
    print(request.sid)
    print("client has connected")
    # emit("connect",{"data":f"id: {request.sid} is connected"})

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
    # emit("disconnect",f"user {request.sid} disconnected",broadcast=True)

@socketio.on('data')
def handle_message(data):
    """event listener when client types a message"""
    print("data from the front end: ",str(data))
    emit("data",{'data':data,'id':request.sid},broadcast=True)


'''
all room functionality below
'''

rooms = {} 
game_states = {}

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

@socketio.on('start_game')
def on_start_game(data):
    room_id = int(data['room_id'])
    if room_id in rooms:
        #data should have keys room_id, player1_json, player2_json
        player1 = data['player1_json'] #dict, with 'name', 'id', 'url'
        player2 = data['player2_json'] #same thing
        game_states[room_id] = [player1, player2] 
        socketio.emit('game_started', {'room_id': room_id, 'game_data': game_states[room_id]}, room=room_id)

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
    room_id = int(data['room_id'])
    if room_id in rooms:
        socketio.emit("game_started", room=room_id)

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


def close_driver():
    driver.close()

close_driver()

if __name__ == '__main__':
    app.run(debug=True)
    close_driver()
