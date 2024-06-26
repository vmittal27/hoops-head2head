import neo4j

def get_shortest_path(driver: neo4j.Driver, src_id: str, dst_id: str):
    records, summary, keys = driver.execute_query(
        f'''
        MATCH (src {{`id`: '{src_id}'}}), (dst {{`id`: '{dst_id}'}})
        MATCH p = ShortestPath((src)-[:PLAYED_WITH*]-(dst))
        RETURN [node IN nodes(p)]
        ''',
        routing_=neo4j.RoutingControl.READ, 
        database_="neo4j"
    )

    players = []

    for record, key in zip(records, keys):
        data = record.data()[key]
        for datum in data:
            players.append(datum['name'])
    
    return players
credentials = {}
with open("credentials.txt") as f:
    lines = f.readlines()
    for line in lines:
        credential = line.strip().split('=')
        if "NEO4J" in credential[0]:
            credentials[credential[0]] = credential[1]
print(credentials)
URI = credentials['NEO4J_URI']
AUTH = (credentials['NEO4J_USER'], credentials['NEO4J_PASSWORD'])

driver = neo4j.GraphDatabase.driver(URI, auth=AUTH)

print(" -> ".join(get_shortest_path(driver, "brockiz01", "lalicpe01")))

driver.close()

