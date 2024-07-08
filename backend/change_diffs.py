from neo4j import GraphDatabase

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


difficulties = {
            'easy': (2.0, 100, 2020, 2024),
            'medium': (1.1, 2.0, 2020, 2024),
            'hard': (0.4, 1.1, 2020, 2024),
            'extreme': (0.2, 1.5, 2000, 2020),
            'legacy': (4.2, float('inf'), 1947, 2024)
        }

#note: to change these, make sure no difficulties overlap 

def determine_difficulty(relevancy, year):
    if relevancy is None or year is None:
        return 'N/A'
    for difficulty, (min_rel, max_rel, min_year, max_year) in difficulties.items():
        if min_rel <= relevancy < max_rel and min_year <= year <= max_year:
            return difficulty
    return 'N/A'

def update_difficulty(tx):
    # Fetch all player nodes
    result = tx.run("MATCH (p:Player) RETURN p.name AS name, p.Relevancy AS relevancy, p.year AS year")
    print(result)
    for record in result:
        name = record["name"]
        relevancy = record["relevancy"]
        year = record["year"]
        new_difficulty = determine_difficulty(relevancy, year)
        # print(name, relevancy, year)
        #Update the node's difficulty
        tx.run("MATCH (p:Player {name: $name}) SET p.difficulty = $difficulty",
               name=name, difficulty=new_difficulty)
        print(name, new_difficulty)
        
# Run the update
with driver.session() as session:
    session.write_transaction(update_difficulty)

driver.close()

print("we good")

