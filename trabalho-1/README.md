# boca-docker

BOCA Online Contest Administrator (known simply as BOCA) is an administration system to held programming contests (e.g., ACM-ICPC, Maratona de Programação da SBC). According to the developers, its main features are portability, concurrency control, multi-site and distributed contests, and a simple web interface (for details refer to https://www.ime.usp.br/~cassio/boca/ and https://github.com/cassiopc/boca).

BOCA is implemented mainly in PHP and makes use of a PostgreSQL database in the backend (see architecture below). It is a good example of a monolithic system, in which the user interface and database access are all interwoven, rather than containing architecturally separate components. The problem is compound due to the low readability and poor code structuring, which is hard to extend and has been barely updated in recent years.

The _boca-docker_ project is a use case of how we can take advantage of microservices architecture and containerization technology (i.e., Docker) to deploy applications in a more convenient and faster way (see illustration below). After quite some reverse engineering, we provide a dockerized version of BOCA's main components (web app, online automated judge and database) aiming at easing the customization, extensibility and automation of the operational effort required to deploy, run and scale BOCA.

## API of Tags

In this subproject of the Database class taught by Professor Rodrigo Laiola Guimaraes, which branches out from the _boca-docker_ project as the Work 1 of the subject, the study and understanding of the backend were carried out to complement what had already been done through the concept of tags in entities. These tags serve to mark and add some information to entities in the BOCA database of certain tables. In this project, the entities that are covered with tags are problems, languages, sites, and users.

Therefore, in this repository, can by find the basic explanation of what had been previously developed by Professor Rodrigo along with other students, and what has been developed now by David Propato and Eduardo Henrique.

In this work, the relationship between entity and tags was understood as a 1-to-many relationship (1xN). Whereas entities represent the tuples in problemtable, langtable, sitetable, and usertable, they are individuals with three partial keys as their composite primary key: contestnumber, their number (their identification number) and entityType (which corresponds to the table the entity belongs to).

As each entity is independent of the others, it is understood that its tags must also be independent of the tags of other entities. This is why the definition of the entity Id influences the tag, allowing different entities to have tags with the same Id, each being independent and referring to specific entities.

With this, the tagtable was developed with 6 columns:

* contestnumber
* entitytype
* entitynumber
* tagnumber
* tagname
* tagvalue

Original architecture | _boca-docker_ architecture with _API_
:-------------------------:|:-------------------------:
![Alt text](/imgs/arquitetura-boca.png?raw=true "boca-docker architecture")  |  ![Alt text](/imgs/arquitetura-boca-docker-api.png?raw=true "boca-docker architecture")

This work started as part of the undergraduate final year project carried out by João Vitor Alves Fazolo under supervision of Prof. Dr. Rodrigo Laiola Guimaraes at Universidade Federal do Espirito Santo ([UFES](https://www.ufes.br/)).

And it continued to be developed in the Database I subject by David Propato and Eduardo Henrique through this work with the API.

## REQUIREMENTS:

* Install [Docker Desktop](https://www.docker.com/get-started).
* Install [Git](https://github.com/git-guides/install-git) (only for building and publishing).

## ⚙️ BUILD AND QUICK START:

* Clone this repository and set it as your working directory

```bash
git clone https://github.com/UFES20231BDCOMP/T2_David_Eduardo.git
cd T2_David_Eduardo
```

* Open a Terminal window and make sure the Docker engine is up and running:

```bash
# List docker images
docker images -a
# List containers
docker container ls -a
```

* Then, start the application:

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.api.yml up -d --build
```

* Or use the alias from docker-script, allow it with:
```bash
chmod +x docker-script.sh
```

* Now you can start the application with:

```bash
./docker-script.sh up
```

#### Voilà! The application should be running now.

* To stop the application (considering that the shell is in the same directory):

```bash
docker compose -f docker-compose.yml -f docker-compose.prod.yml -f docker-compose.api.yml down
```

* Or with docker-script:

```bash
./docker-script.sh down
```

## To use the Tags API:

### GET `http://localhost:8008/api/contest/{contestId}/tags/{entityType}/{entityId}?tagId={tagId}&tagName={tagName}&tagValue={tagValue}`

Retrieve all tags from an entity, with the option to filter the tags using optional parameters (tagId, tagName, tagValue).

* contestId: The Id of an existing contest in the database (corresponds to contestnumber in contesttable).
* entityType: The type of entity /[problem, language, site, site/user]/ (corresponds to an existing entity in one of the tables problemtable, langtable, sitetable, or usertable).
* entityId: The Id of an existing entity in the table it is stored (problemnumber in problemtable, langnumber in langtable, etc).
* tagId: The Id of a tag.
* tagName: The content of the name of one or more tags.
* tagValue: The content of the value of one or more tags.

### POST `http://localhost:8008/api/contest/{contestId}/tags`

Create one or more tags in one or more entities.

* contestId: The Id of an existing contest in the database (corresponds to contestnumber in contesttable).
* body (json):

### PUT `http://localhost:8008/api/contest/{contestId}/tags`

Update one or more tags in one or more entities.

* contestId: The Id of an existing contest in the database (corresponds to contestnumber in contesttable).
* body (json):

### DELETE `http://localhost:8008/api/contest/{contestId}/tags`

Update one or more tags in one or more entities.

* contestId: The Id of an existing contest in the database (corresponds to contestnumber in contesttable).
* body (json):

The body of the request for POST, PUT and DELETE and the response for GET is the same as in the example below;

```
{
    "entityTag": [
        {
            "entityType": "problem",
            "entityId": 2006,
            "tag": [
                {
                    "id": 5,
                    "name": "lang",
                    "value": "mysql"
                },
                {
                    "id": 6,
                    "name": "working",
                    "value": "atividade 02"
                },
                {
                    "id": 7,
                    "name": "working",
                    "value": "p1"
                }
            ]
        },
        {
            "entityType": "site/user",
            "entityId": “1/1001”,
            "tag": [
                {
                    "id": 8,
                    "name": "working",
                    "value": "atividade 01"
                }
            ]
        }
    ]
}
```

The PUT and DELETE methods will be executed for each valid tag, if they find an invalid one, an error will not be returned, however, if all the tags sent are invalid, then an error will be returned.
In the GET method, if there is an invalid tag, none of them are created, in order to protect and validate the entry of new data.

<details>
  <summary><h2>To see BOCA in web and Online judge:</h2></summary>

* Open a web browser and visit the URL http://localhost:8000/boca. First, create and activate a BOCA contest (user: _system_ | password: _boca_). Then, login as admin (user: _admin_ | password: _boca_) to manage users, problems, languages etc. NOTE: consider changing these passwords later on. Find out more information on how to setup a contest [here](https://github.com/cassiopc/boca/tree/master/doc). For general questions about BOCA consider looking at this [forum](https://groups.google.com/g/boca-users).

* The online judge will work only after restarting the `boca-jail` container.

```bash
docker stop docker stop boca-docker_boca-jail_1
docker start docker stop boca-docker_boca-jail_1
```
</details>


## HOW TO DEPLOY IT TO A SWARM:

* Create the stack (make sure Docker Engine is already running in [swarm mode](https://docs.docker.com/engine/swarm/swarm-mode/)):

```bash
docker stack deploy --compose-file docker-compose.yml -c docker-compose.prod.yml boca-stack
```

* Then, check if the stack is running:

```bash
docker stack services boca-stack
```

* Open a web browser and follow the instructions described above.

* To bring the stack down:

```bash
docker stack rm boca-stack
```

## HOW TO ADD CUSTOM CONFIGURATION:

There are many ways to customize the _boca-docker_ application. Without trying to support every possible use case, here are just a few that we have found useful.

* **Environment Variables:** shows the correct syntax for the various ways one can change pre-defined configuration values to keep the _boca-docker_ application flexible and organized. See documentation [here](tests/env/README.md).

* **Docker Secrets:** an alternative way to passing sensitive information via environment variables, causing the initialization scripts to load the values for those variables from files present in the containers. See documentation [here](tests/secrets/README.md).

* **Networking:** shows how to add network isolation between services in the _boca-docker_ application. See documentation [here](tests/networks/README.md).

* **Volume:** demonstrates how to persist data outside BOCA's database container in order to facilitate backup, restore, and migration. See documentation [here](tests/volume/README.md).

* **Healthcheck:** allows a check to be configured in order to determine whether or not the PostgreSQL container is "healthy." This is a particularly neat use case given that the other services depend on that to work. See documentation [here](tests/healthcheck/README.md).

<details>
  <summary><h2>HOW TO PUBLISH IT:</h2></summary>
  
* After building, set the user and image tags accordingly. The IMAGE_ID's will show up with the `docker images -a`.

```bash
docker images -a
docker tag IMAGE_ID_BOCA_BASE ghcr.io/joaofazolo/boca-docker/boca-base:1.1.0
docker tag IMAGE_ID_BOCA_WEB ghcr.io/joaofazolo/boca-docker/boca-web:1.1.0
docker tag IMAGE_ID_BOCA_JAIL ghcr.io/joaofazolo/boca-docker/boca-jail:1.1.0
```

* Log in into GitHub's Container Registry using your username and personal access token (details [here](https://docs.github.com/en/packages/working-with-a-github-packages-registry/working-with-the-container-registry#authenticating-to-the-container-registry)).

        docker login ghcr.io

* Push the container images to repository.

```bash
docker push ghcr.io/joaofazolo/boca-docker/boca-base:1.1.0
docker push ghcr.io/joaofazolo/boca-docker/boca-web:1.1.0
docker push ghcr.io/joaofazolo/boca-docker/boca-jail:1.1.0
```
</details>

## LICENSE:

Copyright Universidade Federal do Espirito Santo (Ufes)

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <https://www.gnu.org/licenses/>.

This program is released under license GNU GPL v3+ license.

## SUPPORT:

Please report any issues with _boca-docker-API_ at [issues](https://github.com/UFES20231BDCOMP/T2_David_Eduardo/issues)
