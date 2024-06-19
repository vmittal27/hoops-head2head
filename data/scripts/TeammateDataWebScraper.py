from bs4 import BeautifulSoup
import requests
import sys
import time

START = "jamesle01"
TOTAL_PLAYERS_IN_NBA = 5208

class TeammateDataWebScraper:
    '''
    Class to manage data collection of all players'
    teammates from https://www.basketball-reference.com/

    TOTAL_PLAYERS_IN_NBA constant needs to be updated manually periodically
    '''

    checked_players: set[str]
    need_to_check_players: set[str]
    failures: list[str]

    def __init__(self) -> None:
        self.checked_players = set()
        self.need_to_check_players = set([START])
        self.failures = []

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

    def get_teammates(self, file) -> None:
        '''
        Scrapes https://www.basketball-reference.com/ given a starting player ID,
        using the page to get other player IDS.

        Stores data as a CSV in the passed in file with the first column containing games played together,
        second containing the player, and third containing the teammmate.

        Contains a hard limit on number of iterations at 1.5x the constant for TOTAL_PLAYERS_IN_NBA
        ''' 

        num_checked_players = 0

        print("Games Played,Player,Teammate", file=file)

        while self.need_to_check_players and num_checked_players < 1.5*TOTAL_PLAYERS_IN_NBA:

            player_id = self.need_to_check_players.pop()
            url = self._get_url(player_id)

            time.sleep(3.1) # basketball-reference maxes at 20 requests/min
            response = requests.get(url)

            if response.status_code != 200:

                if response.status_code == 429:

                    print(
                        f"{time.asctime()}-Accessing {url} for {player_id}. Reason: {response.status_code} {response.reason}. Waiting {response.headers['Retry-After']} secs to retry.",
                        file=sys.stderr
                    )

                    self.need_to_check_players.add(player_id)
                    time.sleep(int(response.headers['Retry-After']))

                else:

                    print(
                        f"{time.asctime()}-ERROR accessing {url} for {player_id}. Reason: {response.status_code} {response.reason}", 
                        file=sys.stderr
                    )
                    self.failures.append(player_id)
                
            else: 
                soup = BeautifulSoup(response.content, 'html.parser')
                teammate_data = self._parse_html(soup, url, player_id)

                for games_played, player, teammate, teammate_id  in teammate_data:
        
                    if teammate_id not in self.checked_players:
    
                        self.need_to_check_players.add(teammate_id)
                        print(f"{games_played},{player},{teammate}", file=file)
                
                self.checked_players.add(player_id)
                num_checked_players += 1

                self._print_progress(
                    num_checked_players,
                    TOTAL_PLAYERS_IN_NBA,
                    f"\033[91m Current Player\033[00m: {player} \033[92m Players in Queue\033[00m: {len(self.need_to_check_players)}"
                )
        
        for i, failure in enumerate(self.failures):
            if failure in self.checked_players:
                self.failures.pop(i)


if __name__ == "__main__":

    scraper = TeammateDataWebScraper()

    with open('teammates.csv', 'w+') as file:

        scraper.get_teammates(file)
    
    with open('checked_players.txt', 'w+') as file:
        print(scraper.checked_players, file=file)
    
    with open('failed_players.txt', 'w+') as file:
        print(scraper.failures, file=file)