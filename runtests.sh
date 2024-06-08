#!/bin/sh

status() {
    printf "\n=====================================================\n"
    printf "%s\n" "$1"
    printf -- "-----------------------------------------------------\n"
}

########################################
######  Testing Course Endpoints  ######
########################################

status 'GET all courses should return SUCCESS'
curl -s http://localhost:8000/courses | json_pp
printf '\n'

status 'GET course-by-id should return SUCCESS'
curl -s http://localhost:8000/courses/2 | json_pp
printf '\n'

status 'GET course-by-id should return FAILURE -- Course does not exist'
curl -s http://localhost:8000/courses/76 | json_pp
printf '\n'

status 'POST /courses should return SUCCESS'
curl -v -s -X POST \
    -H 'Content-Type: application/json' \
    -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjIsImlhdCI6MTcxNzg2NzcxMCwiZXhwIjoxNzE3OTU0MTEwfQ.hhfI_DRjk2U20SBYvOGAW3ICYFPlhG4apLkxh5F1ISs' \
    -d '{
            "subject": "CS",
            "number": "444",
            "title": "Operating Systems II",
            "term": "sp24",
            "instructorId": 2
        }' \
        http://localhost:8000/courses | json_pp
printf '\n'
