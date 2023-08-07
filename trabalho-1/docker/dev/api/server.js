import express from 'express'
import bodyParser from 'body-parser'

import { readTags, readTagsSiteuser, createTags, updateTags, deleteTags } from "./queries.js"

// Constants
const app = express();
const PORT = 8080;
const HOST = '0.0.0.0';

// Configs
app.use(bodyParser.json());
app.use(
    bodyParser.urlencoded({
        extended: true,
    })
);

// ROUTES

/*
    1.1. Recuperar tags de entidade
    URL: <webservice>/api/contest/{contestId}/tags/{entityType}/{entityId}?tagId={tagId}&tagName={tagName}&tagValue={tagValue}
*/
app.get('/api/contest/:contestId/tags/:entityType/:entityId', readTags);

/*
    1.2. Recuperar tags de entidade do tipo site/user
    URL: <webservice>/api/contest/{contestId}/tags/site/user/{entityIdSite}/{entityIdUser}?tagId={tagId}&tagName={tagName}&tagValue={tagValue}
*/
app.get('/api/contest/:contestId/tags/site/user/:entityIdSite/:entityIdUser', readTagsSiteuser);

/*
    2. Criar tags de entidades
*/
app.post('/api/contest/:contestId/tags', createTags);
/*
    3. Atualizar tags de entidades
*/
app.put('/api/contest/:contestId/tags', updateTags);
/*
    4. Excluir tags de entidades
*/
app.delete('/api/contest/:contestId/tags', deleteTags);

// Server
app.listen(PORT, HOST, () => {
    console.log(`Running on http://${HOST}:${PORT}`);
});