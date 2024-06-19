import pandas as pd

teammates = pd.read_csv("teammates-COMPLETED.csv")
players = pd.read_csv("players.csv")

player_set = set(players['Player'])

filtered_teammates = teammates[teammates['Player'].isin(player_set) & teammates['Teammate'].isin(player_set)]

print(f"Shape: {filtered_teammates.shape}")
print(f"Head: {filtered_teammates.head()}")

filtered_teammates.to_csv("NBA_teammates.csv", index=False)