#!/bin/bash

status() {
    printf "\n=============================================================\n"
    printf "%s\n" "$1"
    printf -- "-------------------------------------------------------------\n"
}

check_successful_response() {
    if [ "$1" -eq 200 ] || [ "$1" -eq 201 ] || [ "$1" -eq 204 ]; then
        echo -e "\033[32m PASS\033[0m"
    else
        echo -e "\033[31m FAIL\033[0m"
    fi
}

check_failure_response() {
    if [ "$1" -eq 400 ] || [ "$1" -eq 401 ] || [ "$1" -eq 403 ] || [ "$1" -eq 404 ]; then
        echo -e "\033[32m PASS\033[0m"
    else
        echo -e "\033[31m FAIL\033[0m"
    fi
}

########################################
######  Testing Course Endpoints  ######
########################################

########################################
#  Command to run: bash ./runtests.sh  #
########################################

ADMIN_AUTH_TOKEN="placeholder"
INSTRUCTOR_AUTH_TOKEN_1="placeholder"
INSTRUCTOR_AUTH_TOKEN_2="placeholder"
STUDENT_AUTH_TOKEN="placeholder"


status 'GET all courses should return SUCCESS'
response=$(curl -s http://localhost:8000/courses)
response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/courses)
check_successful_response $response_code
echo $response | json_pp
printf '\n'

status 'GET /courses/{id} should return SUCCESS'
response=$(curl -s http://localhost:8000/courses/2)
response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/courses/2)
check_successful_response $response_code
echo $response | json_pp
printf '\n'

status 'GET /courses/{id} should return FAILURE -- Course does not exist'
response=$(curl -s http://localhost:8000/courses/76)
response_code=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:8000/courses/76)
check_failure_response $response_code
echo $response | json_pp
printf '\n'

status 'POST /courses should return SUCCESS'
response=$(curl -s -w "%{http_code}\n" -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer '"$ADMIN_AUTH_TOKEN"'' \
    -d '{
            "subject": "CS",
            "number": "444",
            "title": "Operating Systems II",
            "term": "sp24",
            "instructorId": 2
        }' \
        http://localhost:8000/courses)

http_code=$(tail -c 4 <<< "$response")
check_successful_response $http_code
content=${response::-3}
echo "$content" | json_pp
printf '\n'

status 'POST /courses should return Failure -- Course already exists'
response=$(curl -s -w "%{http_code}\n" -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer '"$ADMIN_AUTH_TOKEN"'' \
    -d '{
            "subject": "CS",
            "number": "493",
            "title": "Cloud Application Development",
            "term": "sp22",
            "instructorId": 2
        }' \
        http://localhost:8000/courses)

http_code=$(tail -c 4 <<< "$response")
check_failure_response $http_code
content=${response::-3}
echo "$content" | json_pp
printf '\n'

status 'POST /courses should return Failure -- Unauthorized'
response=$(curl -s -w "%{http_code}\n" -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer '"$INSTRUCTOR_AUTH_TOKEN_1"'' \
    -d '{
            "subject": "CS",
            "number": "475",
            "title": "Parallel Programming",
            "term": "fa24",
            "instructorId": 1
        }' \
        http://localhost:8000/courses)

http_code=$(tail -c 4 <<< "$response")
check_failure_response $http_code
content=${response::-3}
echo "$content" | json_pp    
printf '\n'

status 'POST /courses should return Failure -- Unauthorized'
response=$(curl -s -w "%{http_code}\n" -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer '"$STUDENT_AUTH_TOKEN"'' \
    -d '{
            "subject": "CS",
            "number": "325",
            "title": "Analysis of Algorithms",
            "term": "wi24",
            "instructorId": 1
        }' \
        http://localhost:8000/courses)

http_code=$(tail -c 4 <<< "$response")
check_failure_response $http_code
content=${response::-3}
echo "$content" | json_pp
printf '\n'

status 'PATCH /courses/{id} should return SUCCESS'
response=$(curl -s -w "%{http_code}\n" -X PATCH \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer '"$ADMIN_AUTH_TOKEN"'' \
    -d '{
            "subject": "CS",
            "number": "444",
            "title": "Operating Systems II",
            "term": "sp23",
            "instructorId": 2
        }' \
        http://localhost:8000/courses)

http_code=$(tail -c 4 <<< "$response")
check_successful_response $http_code
content=${response::-3}
echo "$content" | json_pp
printf '\n'

status 'PATCH /courses/{id} should return FAILURE -- Missing Fields'
response=$(curl -s -w "%{http_code}\n" -X PATCH \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer '"$ADMIN_AUTH_TOKEN"'' \
    -d '{
            "subject": "CS",
            "number": "444",
            "instructorId": 2
        }' \
        http://localhost:8000/courses)

http_code=$(tail -c 4 <<< "$response")
check_failure_response $http_code
content=${response::-3}
echo "$content" | json_pp
printf '\n'

status 'PATCH /courses/{id} should return FAILURE -- Unauthorized'
response=$(curl -s -w "%{http_code}\n" -X PATCH \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer '"$STUDENT_AUTH_TOKEN"'' \
    -d '{
            "subject": "CS",
            "number": "434",
            "title": "Machine Learning & Data Mining",
            "term": "fa23",
            "instructorId": 1
        }' \
        http://localhost:8000/courses)

http_code=$(tail -c 4 <<< "$response")
check_failure_response $http_code
content=${response::-3}
echo "$content" | json_pp
printf '\n'

status 'PATCH /courses/{id} should return FAILURE -- Unauthorized'
response=$(curl -s -w "%{http_code}\n" -X PATCH \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer '"$INSTRUCTOR_AUTH_TOKEN_2"'' \
    -d '{
            "subject": "CS",
            "number": "434",
            "title": "Machine Learning & Data Mining",
            "term": "fa23",
            "instructorId": 1
        }' \
        http://localhost:8000/courses)

http_code=$(tail -c 4 <<< "$response")
check_failure_response $http_code
content=${response::-3}
echo "$content" | json_pp
printf '\n'