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

def get_two_players(rel_min, rel_max, year_min, year_max):
    """
    Gets 2 random players based on relevancy and year criteria.

    """
    query = f"""
    MATCH (p:Player)
    WITH p, rand() AS r
    WHERE p.Relevancy >= {rel_min} AND p.Relevancy <= {rel_max} AND p.year >= {year_min} AND p.year <= {year_max}
    RETURN p
    ORDER BY r
    LIMIT 2
    """
    with driver.session() as session:
        result = session.run(query)
        return [record["p"] for record in result]


cur_easy = get_two_players(3.5, float('inf'), 2020, 2024)
cur_medium = get_two_players(2, 3, 2015, 2024)
cur_hard = get_two_players(0.5, 1.5, 2015, 2024)
cur_extreme = get_two_players(1.5, 2.5, 2000, 2024)
legacy = get_two_players(3.7, float('inf'), 1947, 2024)
#Grabs two players (returns their node)
#Adjust later
rand_players = cur_easy
for player in rand_players:
    print(player)

close_driver()
