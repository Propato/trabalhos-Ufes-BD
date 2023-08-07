#!/bin/bash

if [[ $1 == "ls" ]]; then
    docker container ls
elif [[ $1 == "up" ]]; then 
    docker-compose up -d
elif [[ $1 == "down" ]]; then
    docker-compose down
elif [[ $1 == "restart" ]]; then
    docker-compose down
    docker-compose up -d
elif [[ $1 == "open" ]]; then
    docker exec -it mysql_T3_Propato mysql -u root -p db
fi
