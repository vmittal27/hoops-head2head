import pandas as pd

teammates = pd.read_csv("data/teammates-all.csv")
players = pd.read_csv("data/players.csv")

player_set = set(players['Player ID'])

filtered_teammates = teammates[teammates['Player ID'].isin(player_set) & teammates['Teammate ID'].isin(player_set)]
players_in_teammates = pd.unique(pd.concat([filtered_teammates['Player ID'], filtered_teammates['Teammate ID']]))

player_diff = player_set.difference(set(players_in_teammates))

if player_diff:
    filtered_players = players[~(players['Player ID'].isin(player_diff))]


print("Teammates Data")
print(f"\tContains {players_in_teammates.size} different players")
print(f"\tShape: {filtered_teammates.shape}")
print(f"\tHead: {filtered_teammates.head()}")

filtered_teammates.to_csv("data/teammates-filtered.csv", index=False)

print("Player Data")
print(f"\tplayers.csv contains {players['Player ID'].size} players")
print(f"\tDiff between Teammates Data: {player_diff}")
if player_diff:
    print("\tBecause there is a difference, a new players-filtered.csv has been created")
    print(f"\tContains {filtered_players['Player ID'].size} different players")

filtered_players.to_csv("data/players-filtered.csv", index=False)