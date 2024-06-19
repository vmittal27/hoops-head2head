from typing import Any
from bs4 import BeautifulSoup
import requests
import time
import sys
import numpy as np


class PlayerDataWebScraper():

    def get_url(self, year):

        if year < 1950:
            return f"https://www.basketball-reference.com/leagues/BAA_{year}_advanced.html"

        return f"https://www.basketball-reference.com/leagues/NBA_{year}_advanced.html"
        

    

    def _print_progress(self, count, total, info=''):
        '''
        Prints a progress bar of the scaper
        '''

        TOTAL_LEN = 50
        filled_len = min(TOTAL_LEN, int(round(TOTAL_LEN * count / float(total))))

        percent = 100.0 * count / float(total)

        sys.stderr.write('\r\033[K')
        sys.stderr.write(f"\033[93m{count}/{total}\033[00m |{'█' * (filled_len)}{' ' * (TOTAL_LEN - filled_len)}| {percent:.2f}% ... {info}")
        sys.stderr.flush()
        
    def __init__(self, max, min):
        self.max_year = max
        self.min_year = min
        self.data = []
        self.indexes = {}
        self.run()

    
    def run(self):
        
        cur_y = self.max_year
        ws_max = 0
        game_max = 0
        while cur_y >= self.min_year:
    
            self._print_progress(self.max_year - cur_y, self.max_year - self.min_year + 1, f"\033[92mCurrent Year\033[0m: {cur_y}")

            url = self.get_url(cur_y)

            response = requests.get(url)
            soup = BeautifulSoup(response.content, 'html.parser')
            table = soup.find_all('tr', class_='full_table')

            for row in table:
                player = row.find('a').get_text() # player
                ws = float(row.find('td', attrs={'data-stat': 'ws'}).get_text() or 0) # win share
                g = int(row.find('td', attrs={'data-stat': 'g'}).get_text() or 0) # games played

                if player in self.indexes:
                    i = self.indexes[player]
                    self.data[i]['winShare'] += ws
                    self.data[i]['games'] += g
                
                else:
                    self.data.append({'player': player, 'winShare': ws, 'games': g, 'year': cur_y})
                    self.indexes[player] = len(self.data) - 1

                ws_max = max(ws, ws_max)
                game_max = max(game_max, g)

            time.sleep(3)
            cur_y -= 1
        weights = {'gp': 0.3, 'ws': 0.4, 'recency': 0.3}
        def recency_factor(last_year, current_year, k=0.1):
            return np.exp(-k * (current_year - last_year))

        def normalize(value, max_value):
            return value / max_value

        def relevance_score(games_played, win_shares, last_year, max_games, max_win_shares, current_year, weights):
            normalized_gp = normalize(games_played, max_games)
            normalized_ws = normalize(win_shares, max_win_shares)
            recency = recency_factor(last_year, current_year)

            return (weights['gp'] * normalized_gp + 
                    weights['ws'] * normalized_ws + 
                    weights['recency'] * recency)

        for player in self.data:
            rel = relevance_score(player['games'], player['winShare'], self.min_year, game_max, ws_max, player['year'], weights)
            player['relevancy'] = rel
                  
        return self.data


if __name__ == "__main__":
    scraper = PlayerDataWebScraper(2024, 1947)
    with open("players.csv", 'w+', encoding = 'utf-8') as file:
        print("Player,Year,Games Played,Win Share, relevancy", file=file)
        
        for datum in scraper.data:
            print(f"{datum['player']},{datum['year']},{datum['games']},{datum['winShare']}, {datum['relevancy']}", file=file)



