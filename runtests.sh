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