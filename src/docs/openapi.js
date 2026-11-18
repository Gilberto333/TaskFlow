const tarefas = require('./tarefas.docs');
const usuarios = require('./usuarios.docs');
const projetos = require('./projetos.docs');
const prioridades = require('./prioridades.docs');
const auth = require('./auth.docs'); // 1. Importa a doc de auth
const comum = require('./comum');

module.exports = {
    openapi: '3.0.3',
    info: {
        title: 'TaskFlow API',
        version: '1.0.0',
        description: 'API do TaskFlow · SENAI CTGAS-ER',
    },
    security: [{ bearerAuth: [] }],

    servers: [{ url: '/', description: 'Este servidor' }],

    // 2. Unifica todas as rotas
    paths: {
        ...auth.paths,
        ...tarefas.paths,
        ...usuarios.paths,
        ...projetos.paths,
        ...prioridades.paths
    },

    components: {
        // 3. Unifica todos os schemas
        schemas: {
            ...comum.schemas,
            ...auth.schemas,
            ...tarefas.schemas,
            ...usuarios.schemas,
            ...projetos.schemas,
            ...prioridades.schemas
        },

        securitySchemes: {
            bearerAuth: {
                type: 'http',
                scheme: 'bearer',
                bearerFormat: 'JWT',
            },
        },
    },
};