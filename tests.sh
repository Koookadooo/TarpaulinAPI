!/bin/bash

baseurl="http://localhost:8000"

check_response() {
    if [ "$1" -eq 200] || [ "$1" -eq 201 ]; then
        echo "Success: $2"
    else
        echo "Failure: $2"
    fi
}

# Add a user
response=$(curl -X 'POST' \
  'https://localhost:8000/users' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Jane Doe",
  "email": "doej@oregonstate.edu",
  "password": "hunter2",
  "role": "student"
}')

check_response $response "Add a user"

# Get the first user ID
response=$(curl -s -o /dev/null -w "%{http_code}" $baseurl/users/1)

check_response $response "Get a user"

# Login a user
response=$(curl -X 'POST' \
  'https://localhost:8000/users/login' \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "email": "jdoe@oregonstate.edu",
  "password": "hunter2"
}')

check_response $response "Login a user"


