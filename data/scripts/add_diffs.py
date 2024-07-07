import os
from PlayerDataWebScraper import PlayerDataWebScraper
import pandas as pd

difficulties = {
            'easy': (2.0, 100, 2020, 2024),
            'medium': (1.1, 2.0, 2020, 2024),
            'hard': (0.4, 1.1, 2020, 2024),
            'extreme': (0.2, 1.5, 2000, 2020),
            'legacy': (4.2, float('inf'), 1947, 2024)
        }



def update_diffs():
    # Get the directory of the current script
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, 'test-players.csv') #change this to players-filtered in the future

    # Print to verify the path
    print(file_path)

    # Check if the file exists
    if not os.path.exists(file_path):
        print(f"The file {file_path} does not exist.")
    else:

        # Open the file and read lines
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()

        new_lines = []
        for line in lines:
            l = line.strip().split(",")
            if l[0] == "Index":
                continue
            else:
                year = int(l[3])
                rel = float(l[6])
                for diff, val in difficulties.items():
                    if val[2] <= year <= val[3]:
                        if val[0] <= rel <= val[1]:
                            if len(l) == 8:
                                l[-1] = diff
                            else:
                                l.append(diff)
                            break

            if len(l) == 7:
                l.append('N/A')
            new_lines.append(",".join(l) + '\n')

        # Write the modified lines back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.writelines(new_lines)

        print("File updated successfully.")


def get_difficulty_sheets():
    #from test-data.csv, separates by difficulty into distinct spreadsheets, this is to make getting random players way easier
    script_dir = os.path.dirname(__file__)
    file_path = os.path.join(script_dir, 'test-players.csv') #change this to players-filtered in the future

    # Print to verify the path
    print(file_path)

    # Check if the file exists
    if not os.path.exists(file_path):
        print(f"The file {file_path} does not exist.")
    else:

        # Open the file and read lines
        with open(file_path, 'r', encoding='utf-8') as file:
            lines = file.readlines()
        for line in lines[1:]:
            l = line.split(",")
            if l[-1][:-1] != 'N/A':
                with open(f'{l[-1][:-1]}_players.txt', 'a', encoding='utf-8') as file:
                    file.write(line)
        
        print("Files Created")


get_difficulty_sheets()
update_diffs()

