#!/bin/bash

if [[ $1 == "up" ]]; then 
    docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.api.yml up -d --build
elif [[ $1 == "down" ]]; then
    docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.api.yml down
elif [[ $1 == "restart" ]]; then
    docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.api.yml down
    docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.api.yml up -d --build
fi
