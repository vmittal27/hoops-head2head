import os

# Get the directory of the current script
script_dir = os.path.dirname(__file__)
file_path = os.path.join(script_dir, 'test-players.csv') #change this to players-filtered in the future

# Print to verify the path
print(file_path)

# Check if the file exists
if not os.path.exists(file_path):
    print(f"The file {file_path} does not exist.")
else:
    difficulties = {
        'easy': (3.5, 100, 2020, 2024),
        'medium': (2.3, 3.5, 2015, 2024),
        'hard': (0.5, 1.5, 2015, 2024),
        'extreme': (1.5, 2.3, 2000, 2024),
        'legacy': (4.2, float('inf'), 1947, 2024)
    }

    # Open the file and read lines
    with open(file_path, 'r', encoding='utf-8') as file:
        lines = file.readlines()

    new_lines = []
    for line in lines:
        l = line.strip().split(",")
        if l[0] == "Index":
            l.append("Difficulty")
        else:
            year = int(l[3])
            rel = float(l[-1])
            for diff, val in difficulties.items():
                if val[2] <= year <= val[3]:
                    if val[0] <= rel <= val[1]:
                        l.append(diff)
                        break
        new_lines.append(",".join(l) + '\n')

    # Write the modified lines back to the file
    with open(file_path, 'w', encoding='utf-8') as file:
        file.writelines(new_lines)

    print("File updated successfully.")
