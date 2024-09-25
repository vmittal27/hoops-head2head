# Backend Web Server

## Setup
In order for the server to run, you must have the `credentials.txt` file in the root of the repository that contains the credentials to read from the Neo4j AuraDB database.

### Virtual Environment
Set up a virtual environment (run all commands from the root of the repository):

```
    virtualenv venv

    source venv/bin/activate

    pip3 install -r requirements.txt
```