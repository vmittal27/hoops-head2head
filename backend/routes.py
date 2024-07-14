from flask import jsonify, request
from neo4j import GraphDatabase
from backend import app

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
    player1_name = data.get('player1_name')
    player2_name = data.get('player2_name')
    if not player1_name or not player2_name:
        return jsonify({'error': 'Missing player names'}), 400
    
    query = f"""
    MATCH (p1 {{`name`: "{player1_name}"}}), (p2 {{`name`: "{player2_name}"}})
    RETURN EXISTS((p1)-[]-(p2)) AS areTeammates
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

#Function to close driver connection
def close_driver():
    driver.close()

close_driver()

if __name__ == '__main__':
    app.run(debug=True)
    close_driver()
