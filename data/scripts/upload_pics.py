import os


#to get every picture url
#all urls follow the following format: https://www.basketball-reference.com/req/202106291/images/headshots/{player_id}.jpg
#we will upload the url to neo4j as a picture_id category in each node, then use the url to render the image on the frontend

def update_pic_data():
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
                l.append("Picture_URL")
            else:
                player_id = l[1]
                url = f'https://www.basketball-reference.com/req/202106291/images/headshots/{player_id}.jpg'
                l.append(url)

            new_lines.append(",".join(l) + '\n')

        # Write the modified lines back to the file
        with open(file_path, 'w', encoding='utf-8') as file:
            file.writelines(new_lines)

        print("File updated successfully.")


update_pic_data()