from bs4 import BeautifulSoup
import requests
import sys
import time

START = "jamesle01"
TOTAL_PLAYERS_IN_NBA = 5209

class BasketballReferenceWebScraper:
    '''
    Class to manage data collection of all players'
    teammates from https://www.basketball-reference.com/
    '''

    scraped_players: set[str]
    need_to_scrape_players: list[str]

    def __init__(self) -> None:
        self.scraped_players = set()
        self.need_to_scrape_players = [START]

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

        sys.stderr.write(f"[{'█' * filled_len}{'-' * (TOTAL_LEN - filled_len)}] {count}/{total} {percent:.2f}% ... {info}\r")
        sys.stderr.flush()

    def get_teammates(self, file) -> None:
        '''
        Scrapes https://www.basketball-reference.com/ given a starting player ID,
        using the page to get other player IDS.

        Stores data as a CSV in the passed in file with the first column containing games played together,
        second containing the player, and third containing the teammmate.
        ''' 
        print("Games Played,Player,Teammate", file=file)

        counter = 0

        while self.need_to_scrape_players and counter < 7000: # second condition ensures any messed up code doesn't destroy computer
    
            player_id = self.need_to_scrape_players.pop()
            url = self._get_url(player_id)

            time.sleep(3)
            response = requests.get(url)

            if response.status_code != 200:

                if response.status_code == 429:

                    print(
                        f"Accesing {url} caused ERROR 429. Waiting {response.headers['Retry-After']} secs to retry.",
                        file=sys.stderr
                    )

                    time.sleep(int(response.headers['Retry-After']))
                    response = requests.get(url)

                else:

                    print(
                        f"""ERROR: {player_id}. Something went wrong accessing {url}.
                        Error code {response.status_code}.
                        Reason: {response.reason}""", 
                        file=sys.stderr
                    )

                    return

            soup = BeautifulSoup(response.content, "html.parser")
            
            try: 

                player = soup.find('span', class_='ac-prefill-name').get_text()
                table = soup.find('table', id='teammates-and-opponents')
                entries = table.find_all('a')
        
                for entry in entries:

                    teammate = entry.get_text()
                    teammate_id = (entry['href'].split("/")[-1])[:-5]
                    games_played = int(entry.parent.next_sibling.get_text())

                    if teammate_id not in self.scraped_players:
    
                        self.need_to_scrape_players.append(teammate_id)
                        print(f"{games_played},{player},{teammate}", file=file)

                self.scraped_players.add(player_id)

                counter += 1

                self._print_progress(counter, TOTAL_PLAYERS_IN_NBA, f"Current Player: {player}")
                    
            except Exception as e:

                print(f"ERROR: {player_id}. Something went wrong parsing HTML: {e}", file=sys.stderr)
                return
    

if __name__ == "__main__":
    scraper = BasketballReferenceWebScraper()
    with open('teammates.csv', 'w+') as file:
        scraper.get_teammates(file)

