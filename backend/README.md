# Cloud Library - Backend

## Available Scripts

In the project directory, you can run:

### `npm start`

Runs the app in the development mode.

Use external app like POSTMAN or curl by shell to interact with backend

## .env FILE
To correctly use the backend, you need to create the .env file. 

This file has to contain:

DB_HOST = value //Who is hosting db? Could be mysql

DB_PORT = value //DB running port

DB_USER = value //DB credentials

DB_PASS = value

DB_NAME = value 

ACCESS_TOKEN_SECRET = value //Token to create seed for bcrypt library

DO_SPACES_KEY = value //If you are using external databases (like DigitalOcean db service, setup access key)

DO_SPACES_SECRET = value //Same as before, but this represents secret key

(DELETE THE COMMENTS)