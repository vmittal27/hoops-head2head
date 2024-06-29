from neo4j import GraphDatabase

uri = "neo4j+s://f14256f5.databases.neo4j.io"
username = "neo4j"
password = "95yimwnb1mOk28HVhnHGJUuP2mGzF3UqEYrwKhAtVKQ"

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
rand_players = get_two_players()
for player in rand_players:
    print(player)

close_driver()
