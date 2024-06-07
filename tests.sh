!/bin/bash

check_response() {
    if [ "$1" -eq 200] || [ "$1" -eq 201 ]; then
        echo "Success: $2"
    else
        echo "Failure: $2"
    fi
}

# Create a new user
response=$(curl -s -w "%{http_code}" -X 'POST' \
  'https://localhost:8000/users' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Jane Doe",
  "email": "doej@oregonstate.edu",
  "password": "hunter2",
  "role": "student"
}')

check_response $response "Create a new user"

# Get the first user ID
response=$(curl -s -w "%{http_code}" -X 'GET' \
  'https://localhost:8000/users/1' \
  -H 'accept: application/json')

check_response $response "Get the first user ID"

# Login a user
response=$(curl -s -w "%{http_code}" -X 'POST' \
  'https://editor.swagger.io/users/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "jdoe@oregonstate.edu",
  "password": "hunter2"
}')

check_response $response "Login a user"


