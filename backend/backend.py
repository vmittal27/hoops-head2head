from flask import Flask, jsonify
from neo4j import GraphDatabase

app = Flask(__name__)

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
    RETURN p1, p2, path
    ORDER BY rand()
    LIMIT 1
    """
    with driver.session() as session:
        result = session.run(query)
        all_info = [{
            'player1': dict(record['p1']),
            'player2': dict(record['p2']),
            'shortest_path': [dict(node) for node in record['path'].nodes]
        } for record in result]
        return all_info
    

@app.route('/<difficulty>')
def get_players(difficulty):
    """
    Endpoint to get players based on difficulty level.
    """
    difficulties = {
        'easy': (3.5, float('inf'), 2020, 2024),
        'medium': (2, 3, 2015, 2024),
        'hard': (0.5, 1.5, 2015, 2024),
        'extreme': (1.5, 2.5, 2000, 2024),
        'legacy': (3.7, float('inf'), 1947, 2024)
    }
    if difficulty in difficulties:
        rel_min, rel_max, year_min, year_max = difficulties[difficulty]
        info = get_two_players(rel_min, rel_max, year_min, year_max)
        return info
    else:
        return jsonify({'error': 'Difficulty level not found'}), 404


#Function to close driver connection
def close_driver():
    driver.close()

close_driver()

if __name__ == '__main__':
    app.run(debug=True)
