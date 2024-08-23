import logging
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
    print("user disconnected")
    # emit("disconnect",f"user {request.sid} disconnected",broadcast=True)

@socketio.on('data')
def handle_message(data):
    """event listener when client types a message"""
    print("data from the front end: ",str(data))
    emit("data",{'data':data,'id':request.sid},broadcast=True)

@socketio.on('join')
def on_join(data):
    username = data['username']
    room = data['room']
    join_room(room)
    emit(username + ' has entered the room.', to=room)

@socketio.on('leave')
def on_leave(data):
    username = data['username']
    room = data['room']
    leave_room(room)
    emit(username + ' has left the room.', to=room)

#Function to close driver connection
def close_driver():
    driver.close()

close_driver()

if __name__ == '__main__':
    app.run(debug=True)
    close_driver()
