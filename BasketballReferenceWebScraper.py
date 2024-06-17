from bs4 import BeautifulSoup
import requests
import sys
import time
import re
import pickle
import os

'''
If running on own machine: make sure you have dependencies installed
First cd to the requested directory, then: 
-pip3 install bs4
-pip3 install requests
'''
START = "jamesle01"
TOTAL_PLAYERS_IN_NBA = 5208

class BasketballReferenceWebScraper:
    '''
    Class to manage data collection of all players'
    teammates from https://www.basketball-reference.com/

    TOTAL_PLAYERS_IN_NBA constant needs to be updated manually periodically
    '''

    checked_players: set[str]
    need_to_check_players: set[str]
    failures: list[str]
    players : dict[str, tuple]
    idx : int

    def __init__(self) -> None:
        self.checked_players = set()
        self.need_to_check_players = set([START])
        self.failures = []
        self.players = dict()
        self.idx = 0
        self.players_file = 'players.pkl'
        self.load_players()
    
    def load_players(self) -> None:
        ''' 
        Load players dictionary from file if it exists.
        Ensures that we need not continue running get_players every time
        May want to switch this to json later on, but pickle is good for storing dicts
        '''
        if os.path.exists(self.players_file):
            with open(self.players_file, 'rb') as file:
                self.players = pickle.load(file)
                self.idx = max(info[0] for info in self.players.values()) + 1
            print(f"Loaded {len(self.players)} players from {self.players_file}")
    
    def save_players(self) -> None:
        '''Save players dictionary to file.'''
        with open(self.players_file, 'wb') as file:
            pickle.dump(self.players, file)
        print(f"Saved {len(self.players)} players to {self.players_file}")

    def _get_url(self, player_id: str) -> str:
        '''
        Given a player id, returns the URL that containes that players' teammmates
        '''
        return f"https://www.basketball-reference.com/friv/teammates_and_opponents.fcgi?pid={player_id}&type=t"

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

    def _parse_html(self, soup: BeautifulSoup, url: str, player_id: str) -> list[tuple[int, str, str, str]]:
        '''
        Given a BeautifulSoup object, url, and player ID,
        parses the tree and returns a list of tuples
        where each tuple contains the number of games played together,
        the original player, the teammate, and teammate id. 
        '''
        
        teammate_data = []

        try: 

            player = soup.find('span', class_='ac-prefill-name').get_text()
            table = soup.find('table', id='teammates-and-opponents')
            entries = table.find_all('a')
    
            for entry in entries:

                teammate = entry.get_text()
                teammate_id = (entry['href'].split("/")[-1])[:-5]
                games_played = int(entry.parent.next_sibling.get_text())
        
                teammate_data.append((games_played, player, teammate, teammate_id))

            return teammate_data
                
        except Exception as e:

            print(f"{time.asctime()}-ERROR parsing HTML at {url} for {player}: {e}", file=sys.stderr)
            self.failures.append(player_id)

    def _player_in_bounds(self, soup: BeautifulSoup, url: str, year: int) -> None:
        '''
        https://www.basketball-reference.com/leagues/NBA_2024_per_game.html gives a list of players
        Get this until 2000, add every player to a csv doc.
        '''

        table = soup.find('table', id = "per_game_stats")
        entries = table.find_all('a', href=re.compile("players"))
        try:

            for entry in entries:
                player_id = entry['href'].split("/")[-1][:-5]
                player_name = entry.get_text()
                if player_id not in self.players:
                    self.players[player_id] = (self.idx, player_name, year)
                    self.idx += 1


        except Exception as e:
            print(f"{time.asctime()}-ERROR parsing HTML at {url} for {player_id}: {e}", file=sys.stderr)
            self.failures.append(player_id)
        
   
    def get_players(self, file_path : str) -> None:
        year = 2024
        while year >= 2000:
            time.sleep(3.1) # basketball-reference maxes at 20 requests/min
            url = f'https://www.basketball-reference.com/leagues/NBA_{year}_per_game.html'
            response = requests.get(url)

            if response.status_code != 200:
                if response.status_code == 429:
                    print(
                        f"{time.asctime()}-Accessing {url} for {year} players. Reason: {response.status_code} {response.reason}. Waiting {response.headers['Retry-After']} secs to retry.",
                        file=sys.stderr
                    )
                    time.sleep(int(response.headers['Retry-After']))
                else:
                    print(
                        f"{time.asctime()}-ERROR accessing {url} for {year}. Reason: {response.status_code} {response.reason}", 
                        file=sys.stderr
                    )
                    self.failures.append(year)
            else: 
                soup = BeautifulSoup(response.content, 'html.parser')
                self._player_in_bounds(soup, url, year)
            
            print(f"Total players collected: {len(self.players)}")

            year -= 1
        

        with open(file_path, 'w', encoding='utf-8') as file:
            for player_id, info in self.players.items():    
                file.write(f"{player_id},{info[0]},{info[1]},{info[2]}\n")
        self.save_players()
    
    def get_teammates(self, file_path : str) -> None:
        '''
        Uses dict players to generate list of teammates in order of index/year
        ''' 
        self.load_players()
        for player_id in self.players:
            time.sleep(3.1)
            url = self._get_url(player_id)
            response = requests.get(url)
        
            if response.status_code != 200:

                if response.status_code == 429:

                    print(
                        f"Accesing {url} caused ERROR 429. Waiting {response.headers['Retry-After']} secs to retry.",
                        f"{time.asctime()}-Accessing {url} for {player_id}. Reason: {response.status_code} {response.reason}. Waiting {response.headers['Retry-After']} secs to retry.",
                        file=sys.stderr
                    )

                    self.need_to_check_players.add(player_id)
                    time.sleep(int(response.headers['Retry-After']))
                    response = requests.get(url)

                else:

                    print(
                        f"""ERROR: {player_id}. Something went wrong accessing {url}.
                        Error code {response.status_code}.
                        Reason: {response.reason}""", 
                        f"{time.asctime()}-ERROR accessing {url} for {player_id}. Reason: {response.status_code} {response.reason}", 
                        file=sys.stderr
                    )
                    self.failures.append(player_id)

            else:

                soup = BeautifulSoup(response.content, 'html.parser')
                teammate_data = self._parse_html(soup, url, player_id)

                with open(file_path, 'a', encoding='utf-8') as file:
                    for games_played, player, teammate, teammate_id in teammate_data:    
                        print(f"{player_id},{teammate_id},{player},{teammate}, {games_played}", file=file)

                    

                    

        
    
            



if __name__ == "__main__":

    scraper = BasketballReferenceWebScraper()

    # with open('players2000-2024.csv', 'w+') as file:

    # scraper.get_players('players2000-2024.csv') 
    scraper.get_teammates('teammates-inorder.csv')
    
    # with open('teammates.csv', 'w+') as file:

    #     scraper.get_teammates(file)
    
    # with open('checked_players.txt', 'w+') as file:
    #     print(scraper.checked_players, file=file)
    
    # with open('failed_players.txt', 'w+') as file:
    #     print(scraper.failures, file=file)

