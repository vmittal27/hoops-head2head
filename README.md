# hoops-head2head


## How to Run

After installing the required dependencies, build the static site by running the following command in the `react-frontend` folder
```sh
yarn vite build
```

Then, boot up the web server with the following command from the root:
```sh
gunicorn --worker-class eventlet -w 1 -b localhost:3000 backend:app
```