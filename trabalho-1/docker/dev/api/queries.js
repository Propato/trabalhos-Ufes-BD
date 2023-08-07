import pkg from 'pg';
const { Pool } = pkg;

const pool = new Pool({
    user: 'postgres',
    host: 'boca-db',
    database: 'bocadb',
    password: 'superpass',
    port: 5432,
});

// Funções para checar se o contestnumber é válido (se existe uma tupla em contesttable com este contestnumber) e se a entidade é válida (entityId existe na tabela correspondente ao seu tipo).
async function checkContentId(id){
    const contestQuery = `SELECT contestnumber FROM contesttable WHERE "contestnumber" = ${id};`
    const resultContestQuery = (await pool.query(contestQuery)).rowCount;
    
    return !resultContestQuery;
}
async function checkEntity(contestId, entityType, entityId){

    switch (entityType) {
        case "problem" || "site": break;
        case "language":
            entityType = "lang";
            break;
        case "site/user":
            const siteUserId = entityId.split('/');
            const contestQuery = `SELECT contestnumber, usersitenumber, usernumber FROM usertable WHERE "contestnumber" = ${contestId} AND "usersitenumber" = ${siteUserId[0]} AND "usernumber" = ${siteUserId[1]};`
            const resultContestQuery = await pool.query(contestQuery);
    
            return !(resultContestQuery.rowCount);
    }

    const contestQuery = `SELECT contestnumber, ${entityType}number FROM ${entityType}table WHERE "contestnumber" = ${contestId} AND "${entityType}number" = ${entityId};`
    const resultContestQuery = await pool.query(contestQuery);
    
    return !(resultContestQuery.rowCount);
}

// Função para converter o vetor de tuplas retornado pelo pool do metodo GET para um json no modelo de exemplo deste trabalho.
function parser(tags){

    const entityTag = [];

    tags.forEach(row => {
        // Checa se a entidade já existe no entityTags.
        const entityIndex = entityTag.findIndex(item => item.entityId === row.entitynumber && item.entityType === row.entitytype);
        
        if (entityIndex === -1) {
            // Se não existe, cria uma nova entidade e armazena ela com sua determinada tag.
            const newEntity = {
            entityType: row.entitytype,
            entityId: row.entitynumber,
            tag: [{
                id: row.tagnumber,
                name: row.tagname,
                value: row.tagvalue
            }]
            };
            
            entityTag.push(newEntity);
        } else {
            // Se a entidade já existe, adiciona a tag à ela.
            const tag = {
            id: row.tagnumber,
            name: row.tagname,
            value: row.tagvalue
            };
            
            entityTag[entityIndex].tag.push(tag);
        }
    });

    // Cria o objeto final e o retorna.
    return { entityTag };
}

/*
    1.1 Recuperar tags de entidade
    Esta operação recupera uma lista de tags que são definidas para qualquer entidade do BOCA.
*/
export async function readTags(req, res) {

    const params = req.params; // contestId, entityType, entityId
    const tag = req.query; // tagId, tagName, tagValue
    
    try {
        // Checa se o contestId é válido.
        if(await checkContentId(params.contestId))
            throw new Error("Invalid contest");
        
        // Define as colunas usadas e os valores para buscar na query com base nas informações passadas (pois há parametros de busca que são opcionais).
        let columns = `("contestnumber", "entitytype", "entitynumber"`;
        let values = `(${params.contestId}, '${params.entityType}', '${params.entityId}'`;

        if(tag.tagId) { columns += `, "tagnumber"`; values += `, ${tag.tagId}`}
        if(tag.tagName) { columns += `, "tagname"`; values += `, '${tag.tagName}'`}
        if(tag.tagValue) { columns += `, "tagvalue"`; values += `, '${tag.tagValue}'`}
        columns += ")";
        values += ")";

        // Estrutura a query completa.
        const query = `SELECT * FROM tagtable WHERE ${columns} = ${values};`;
        console.log(query);

        // Executa a query e checa seu retorno.
        const resultQuery = await pool.query(query);
        if(resultQuery.rowCount){
            // Retorna a resposta com status 200 (sucesso) e o json das tags requisitadas.
            res.status(200).json(parser(resultQuery.rows));
        } else {
            throw new Error("Invalid entity");
        }
    } catch (e) {
        console.error(e);

        // Retorna a resposta com status 404 (fracasso, contestId inválido) e a mensagem de erro indicando o erro no contestId.
        if(e.message === "Invalid contest")
            res.status(404).send('Not Found: O ID da competição especificado na requisição não existe.');
        // Retorna a resposta com status 400 (fracasso) e a mensagem indicando o erro dos parametros.
        else if(e.message === "Invalid entity")
            res.status(400).send('Bad Request: Pelo menos um dos parâmetros fornecidos na requisição é inválido.');
        else
            res.status(400).send('BAD REQUEST: Pelo menos um dos parâmetros fornecidos na requisição é inválido.');
    }
}

/*
    1.2 Recuperar tags de entidade para o caso de tipo site/user
    Esta operação recupera uma lista de tags que são definidas para qualquer entidade do BOCA.
*/
export async function readTagsSiteuser(req, res) {

    const entity = req.params; // contestId, entityType, entityId

    /*
    Como na URL que chama esta função o entityType e o entityId possuem um '/' no meio, foi necessário fazer esta função auxiliar para tratar estes parametros separados, definindo o entityType e concatenando o entityId e depois chamando a função padrão readTags.
    Isso funciona neste código pois o entityType é um varchar no banco de dados e o entityId também, justamente para poder armazenar o id destes tipos de entitades sem a necessidade de uma coluna extra para dividir este Id.
    */
    req.params = {
        "contestId": entity.contestId,
        "entityType": 'site/user',
        "entityId": entity.entityIdSite + '/' + entity.entityIdUser
    };

    readTags(req, res);
}

/*
    2. Criar tags de entidades
    Esta operação cria novas tags para uma ou mais entidades do BOCA.
*/
export async function createTags(req, res) {

    const contestId = req.params.contestId; // contestId
    const entities = req.body.entityTag; // entityType, entityId, tagId, tagName, tagVal

    try {
        // Checa se o contestId é válido.
        if(await checkContentId(contestId))
            throw new Error("Invalid contest");

        // Estrutura a query para a criação da uma ou múltiplas novas tags realizando apenas um pool, para que seja possivel fazer a cchecagem se a entidade existe no banco de dados, as definições de cada uma são inseridas através de uma promisse que, caso a entidade nao exista no banco, a promisse retorna uma exceção que encerra a criação de qualquer nova tag.
        let query = `INSERT INTO tagtable ("contestnumber", "entitytype", "entitynumber", "tagnumber", "tagname", "tagvalue") VALUES `;
        
        const promisesEntities = entities.map(async (entity, i) => {
            if (await checkEntity(contestId, entity.entityType, entity.entityId))
                throw new Error("Invalid entity");
            else {
                if(i!==0) query+= ', ';
                entity.tag.forEach( (tag, j) => {
                    if (j !== 0) query += ', ';
                    query += `(${contestId}, '${entity.entityType}', '${entity.entityId}', ${tag.id}, '${tag.name}', '${tag.value}')`;
                });
            }
        });
        await Promise.all(promisesEntities);

        query += `;`;
        console.log(query);

        // Executa a query e checa seu retorno.
        const resultQuery = await pool.query(query);
        if(resultQuery.rowCount)
            // Retorna a resposta com status 204 (sucesso) e a mensagem de sucesso.
            res.status(204).send('Sucess: tag(s) atualizada(s).');
        else
            throw new Error("Invalid entity");
    } catch (e) {
        console.error(e);

        // Retorna a resposta com status 404 (fracasso, contestId inválido) e a mensagem de erro indicando o erro no contestId.
        if(e.message === "Invalid contest")
            res.status(404).send('Not Found: O ID da competição especificado na requisição não existe.');
        // Retorna a resposta com status 400 (fracasso) e a mensagem indicando o erro nos dados da requisição.
        else if (e.message === "Invalid entity")
            res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.');
        else
            res.status(400).send('BAD REQUEST: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.');
    }
}

/*
    3. Atualizar tags de entidades
    Esta operação atualiza tags existentes para uma ou mais entidades do BOCA.
*/
export async function updateTags(req, res) {

    const contestId = req.params.contestId; // contestId
    const entities = req.body.entityTag; // entityType, entityId, tagId, tagName, tagVal

    try {
        // Checa se o contestId é válido.
        if(await checkContentId(contestId))
            throw new Error("Invalid contest");

        // Estrutura a query a ser executada para que seja feito apenas um pool.
        let query = `UPDATE tagtable SET "tagname" = CASE `;
        let queryValue = '', queryEntities = '';
        entities.forEach((entity, i) => {
            entity.tag.forEach((tag, j) => {
                query += `WHEN ("contestnumber", "entitytype", "entitynumber", "tagnumber") = (${contestId}, '${entity.entityType}', '${entity.entityId}', ${tag.id}) THEN '${tag.name}' `;

                queryValue += `WHEN ("contestnumber", "entitytype", "entitynumber", "tagnumber") = (${contestId}, '${entity.entityType}', '${entity.entityId}', ${tag.id}) THEN '${tag.value}' `;

                queryEntities += `(${contestId}, '${entity.entityType}', '${entity.entityId}', ${tag.id})`
                if(i !== entities.length-1 || j !== entity.tag.length-1) queryEntities+= ', ';
            });
        });
        query += `END, "tagvalue" = CASE ` + queryValue + `END WHERE ("contestnumber", "entitytype", "entitynumber", "tagnumber") IN ( ` + queryEntities + `);`
        console.log(query);

        // Executa a query e checa seu retorno.
        const resultQuery = await pool.query(query);
        if(resultQuery.rowCount)
            // Retorna a resposta com status 204 (sucesso) e a mensagem de sucesso.
            res.status(204).send('Sucess: tag(s) atualizada(s).');
        else
            // Se nenhuma query foi modificada é lançado o erro.
            throw new Error("Invalid entity");
    } catch (e) {
        console.error(e);

        // Retorna a resposta com status 404 (fracasso, contestId inválido) e a mensagem de erro indicando o erro no contestId.
        if(e.message === "Invalid contest")
            res.status(404).send('Not Found: O ID da competição especificado na requisição não existe.');
        // Retorna a resposta com status 400 (fracasso) e a mensagem indicando o erro nos dados da requisição e encerra a atualização das tags.
        else if (e.message === "Invalid entity")
            res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.');
        else
            res.status(400).send('BAD REQUEST: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.');
    }
}

/*
    4. Excluir tags de entidades
    Esta operação exclui tags existentes para uma ou mais entidades do BOCA.
*/
export async function deleteTags(req, res) {
    
    const contestId = req.params.contestId; // contestId
    const entities = req.body.entityTag; // entityType, entityId, tagId, tagName, tagVal
    
    try {
        // Checa se o contestId é válido.
        if(await checkContentId(contestId))
            throw new Error("Invalid contest");

        // Estrutura a query para o DELETE de diversas tags com um unico pool.
        let query = '';
        entities.forEach((entity, i) => {
            if(i === 0)
                query = `DELETE FROM tagtable WHERE "contestnumber" = ${contestId} AND (( ("entitytype", "entitynumber") = ('${entity.entityType}', '${entity.entityId}') `;
            else
                query += `OR ( ("entitytype", "entitynumber") = ('${entity.entityType}', '${entity.entityId}') `;

            entity.tag.forEach((tag, j) => {
                if(j === 0)
                    query += `AND ("tagnumber" = ${tag.id} `
                else
                    query += `OR "tagnumber" = ${tag.id} `
            });
            query += ')) ';
        });
        query += ');';
        console.log(query);

        // Executa a query e checa seu retorno.
        const resultQuery = await pool.query(query);
        if(resultQuery.rowCount)
            // Retorna a resposta com status 204 (sucesso) e a mensagem de sucesso.
            res.status(204).send('Sucess: tag(s) deletadas(s).');
        else
            // Se nenhuma query foi deletada é lançado o erro.
            throw new Error("Invalid entity");
    } catch (e) {
        console.error(e);

        // Retorna a resposta com status 404 (fracasso, contestId inválido) e a mensagem de erro indicando o erro no contestId.
        if(e.message === "Invalid contest")
            res.status(404).send('Not Found: O ID da competição especificado na requisição não existe.');
        // Retorna a resposta com status 400 (fracasso) e a mensagem indicando o erro nos dados da requisição.
        else if(e.message === "Invalid entity")
            res.status(400).send('Bad Request: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.');
        else
            res.status(400).send('BAD REQUEST: O ID da competição ou o JSON fornecido no corpo da requisição é inválido.');
    }
}