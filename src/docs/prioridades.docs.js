const { json } = require('./comum');

const paths = {
    '/prioridades': {
        get: {
            tags: ['Prioridades'],
            summary: 'Lista todas as prioridades',
            responses: {
                '200': { description: 'Lista de prioridades obtida com sucesso' },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
            },
        },
    },
};

const schemas = {
    Prioridade: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            descricao: { type: 'string', example: 'Alta' },
            ordem: { type: 'integer', example: 1 },
        },
    },
};

module.exports = { paths, schemas };