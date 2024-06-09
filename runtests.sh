#!/bin/bash

baseurl="http://localhost:8000"
expected_tests=0
passed_tests=0

check_response() {
    ((expected_tests++))
    if [ "$1" -eq "$2" ]; then
        echo "Success: $3"
        ((passed_tests++))
    else
        echo "Failure: $3"
    fi
}

section() {
    printf "\n########################################\n"
    printf "######  %s  ######\n" "$1"
    printf "########################################\n"
}

test_status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}

########################################
######  Testing User Endpoint  ######
########################################

section 'Testing User Endpoint'

# Test to add a user
test_status 'Add a user'
response=$(curl -s -w "\n%{http_code}" -X 'POST' \
  "${baseurl}/users" \
  -H 'accept: application/json' \
  -H 'Content-Type: application/json' \
  -d '{
  "name": "Agent Smith",
  "email": "smitha@oregonstate.edu",
  "password": "hunter2",
  "role": "student"
}')
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 201 "Add a user"

# Test to login with new user
test_status 'POST student login to get JWT token'
STUDENT_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H 'Content-Type: application/json' \
    -d '{
            "email": "smitha@oregonstate.edu",
            "password": "hunter2"
        }' \
        ${baseurl}/users/login)
status_code=$(echo "$STUDENT_RESPONSE" | tail -n1)
STUDENT_TOKEN=$(echo "$STUDENT_RESPONSE" | head -n -1 | jq -r '.token')
echo "$STUDENT_RESPONSE" | head -n -1 | jq .
if [ "$STUDENT_TOKEN" = "null" ]; then
    echo "Student login failed: $STUDENT_RESPONSE"
fi
check_response $status_code 200 "POST student login to get JWT token"

# Test to login with admin user
test_status 'POST admin login to get JWT token'
ADMIN_RESPONSE=$(curl -s -w "\n%{http_code}" -X POST \
    -H 'Content-Type: application/json' \
    -d '{
            "email": "neo@example.com",
            "password": "password123"
        }' \
        ${baseurl}/users/login)
status_code=$(echo "$ADMIN_RESPONSE" | tail -n1)
ADMIN_TOKEN=$(echo "$ADMIN_RESPONSE" | head -n -1 | jq -r '.token')
echo "$ADMIN_RESPONSE" | head -n -1 | jq .
if [ "$ADMIN_TOKEN" = "null" ]; then
    echo "Admin login failed: $ADMIN_RESPONSE"
fi
check_response $status_code 200 "POST admin login to get JWT token"

# Test to get a user
test_status 'Get a user'
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $STUDENT_TOKEN" $baseurl/users/4)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 200 "Get a user"

########################################
######  Testing Course Endpoints  ######
########################################

section 'Testing Course Endpoints'

# Test to get all courses
test_status 'GET all courses should return SUCCESS'
response=$(curl -s -w "\n%{http_code}" ${baseurl}/courses)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 200 "GET all courses should return SUCCESS"
printf '\n'

# Test to get course by id
test_status 'GET course-by-id should return SUCCESS'
response=$(curl -s -w "\n%{http_code}" ${baseurl}/courses/2)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 200 "GET course-by-id should return SUCCESS"
printf '\n'

# Test to get course by id
test_status 'GET course-by-id should return FAILURE -- Course does not exist'
response=$(curl -s -w "\n%{http_code}" ${baseurl}/courses/76)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 404 "GET course-by-id should return FAILURE -- Course does not exist"
printf '\n'

# Test to make a course
test_status 'POST /courses should return SUCCESS for admin'
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
            "subject": "CS",
            "number": "499",
            "title": "Virtual Reality",
            "term": "sp24",
            "instructorId": 2
        }' \
        ${baseurl}/courses)
status_code=$(echo "$response" | tail -n1)
course_id=$(echo "$response" | head -n -1 | jq -r '.id')
echo "$response" | head -n -1 | jq .
check_response $status_code 201 "POST /courses should return SUCCESS for admin"
printf '\n'

# Test to make a course
test_status 'POST /courses should return FAILURE for student'
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d '{
            "subject": "CS",
            "number": "555",
            "title": "Machine Vision",
            "term": "fa24",
            "instructorId": 2
        }' \
        ${baseurl}/courses)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 403 "POST /courses should return FAILURE for student"
printf '\n'

# Test to delete a course
test_status 'DELETE course should return SUCCESS for admin'
response=$(curl -s -w "\n%{http_code}" -X DELETE \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    ${baseurl}/courses/$course_id)
status_code=$(echo "$response" | tail -n1)
check_response $status_code 204 "DELETE course should return SUCCESS for admin"
printf '\n'

# Test to enroll students to a course
test_status 'POST enroll students to a course should return SUCCESS for admin'
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
            "add": [4],
            "remove": []
        }' \
        ${baseurl}/courses/1/students)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 200 "POST enroll students to a course should return SUCCESS for admin"
printf '\n'

# Test to enroll students to a course
test_status 'POST enroll students to a course should return FAILURE for student'
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d '{
            "add": [4],
            "remove": []
        }' \
        ${baseurl}/courses/2/students)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 403 "POST enroll students to a course should return FAILURE for student"
printf '\n'

# Test to get students in a course
test_status 'GET students in a course should return SUCCESS for admin'
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" ${baseurl}/courses/1/students)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 200 "GET students in a course should return SUCCESS for admin"
printf '\n'

# Test to get students in a course
test_status 'GET students in a course should return FAILURE for student'
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $STUDENT_TOKEN" ${baseurl}/courses/1/students)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 403 "GET students in a course should return FAILURE for student"
printf '\n'

# Test to unenroll students from a course
test_status 'POST unenroll students from a course should return SUCCESS for admin'
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $ADMIN_TOKEN" \
    -d '{
            "add": [],
            "remove": [4]
        }' \
        ${baseurl}/courses/1/students)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 200 "POST unenroll students from a course should return SUCCESS for admin"
printf '\n'

# Test to unenroll students from a course
test_status 'POST unenroll students from a course should return FAILURE for student'
response=$(curl -s -w "\n%{http_code}" -X POST \
    -H 'Content-Type: application/json' \
    -H "Authorization: Bearer $STUDENT_TOKEN" \
    -d '{
            "add": [],
            "remove": [4]
        }' \
        ${baseurl}/courses/1/students)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 403 "POST unenroll students from a course should return FAILURE for student"
printf '\n'

# Test to get roster CSV for a course
test_status 'GET roster CSV for a course should return SUCCESS for admin'
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" ${baseurl}/courses/1/roster -o roster.csv)
status_code=$(echo "$response" | tail -n1)
check_response $status_code 200 "GET roster CSV for a course should return SUCCESS for admin"
printf "CSV saved to roster.csv\n"
printf '\n'

# Test to get assignments
test_status 'GET assignments in a course should return SUCCESS'
response=$(curl -s -w "\n%{http_code}" -H "Authorization: Bearer $ADMIN_TOKEN" ${baseurl}/courses/1/assignments)
status_code=$(echo "$response" | tail -n1)
echo "$response" | head -n -1 | jq .
check_response $status_code 200 "GET assignments in a course should return SUCCESS"
printf '\n'

# Print summary of test results
echo "====================================================="
echo "Test Results"
echo "-----------------------------------------------------"
echo "Expected Tests: $expected_tests"
echo "Passed Tests: $passed_tests"
echo "====================================================="
