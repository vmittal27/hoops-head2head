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

#Function to close driver connection
def close_driver():
    driver.close()

def get_two_players():
    """
    Gets 2 random players
    """
    query = """
    MATCH (p:Player)
    WITH p, rand() AS r
    RETURN p
    ORDER BY r
    LIMIT 2
    """
    with driver.session() as session:
        result = session.run(query)
        return [record["p"] for record in result]

#Grabs two players (returns their node)
#Adjust later
rand_players = get_two_players()
for player in rand_players:
    print(player)

close_driver()
