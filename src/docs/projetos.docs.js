const { json, parametroId } = require('./comum');

const paths = {
    '/projetos': {
        get: {
            tags: ['Projetos'],
            summary: 'Lista todos os projetos',
            parameters: [
                {
                    name: 'usuario_id',
                    in: 'query',
                    required: false,
                    schema: { type: 'integer', example: 14 },
                    description: 'Filtra os projetos por ID do usuário',
                },
            ],
            responses: {
                '200': { description: 'Lista de projetos obtida com sucesso' },
                '400': { description: 'Parâmetro de filtro inválido', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
            },
        },
        post: {
            tags: ['Projetos'],
            summary: 'Cria um novo projeto',
            requestBody: { required: true, content: json('ProjetoEntrada') },
            responses: {
                '201': { description: 'Projeto criado com sucesso', content: json('Projeto') },
                '400': { description: 'Dados inválidos ou nome ausente', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
            },
        },
    },

    '/projetos/{id}': {
        get: {
            tags: ['Projetos'],
            summary: 'Busca um projeto pelo id',
            parameters: [parametroId],
            responses: {
                '200': { description: 'Projeto encontrado', content: json('Projeto') },
                '400': { description: 'ID de projeto inválido', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Projeto não encontrado', content: json('Erro') },
            },
        },
        put: {
            tags: ['Projetos'],
            summary: 'Atualiza um projeto',
            parameters: [parametroId],
            requestBody: { required: true, content: json('ProjetoEntrada') },
            responses: {
                '200': { description: 'Projeto atualizado com sucesso', content: json('Projeto') },
                '400': { description: 'Dados inválidos ou ID de projeto inválido', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Projeto não encontrado', content: json('Erro') },
            },
        },
        delete: {
            tags: ['Projetos'],
            summary: 'Exclui um projeto',
            parameters: [parametroId],
            responses: {
                '200': {
                    description: 'Projeto removido com sucesso',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    mensagem: { type: 'string', example: 'Projeto removido com sucesso' },
                                    id: { type: 'integer', example: 1 },
                                },
                            },
                        },
                    },
                },
                '400': { description: 'ID de projeto inválido', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Projeto não encontrado', content: json('Erro') },
            },
        },
    },
};

const schemas = {
    ProjetoEntrada: {
        type: 'object',
        properties: {
            nome: {
                type: 'string',
                example: 'Reformulação do Website',
            },
            descricao: {
                type: 'string',
                example: 'Projeto para atualização da interface do sistema',
            },
            usuario_id: {
                type: 'integer',
                example: 14,
                description: 'ID do usuário proprietário do projeto',
            },
        },
        required: ['nome'],
    },
    Projeto: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Reformulação do Website' },
            descricao: { type: 'string', example: 'Projeto para atualização da interface do sistema' },
            usuario_id: { type: 'integer', example: 14 },
            criado_em: { type: 'string', format: 'date-time' },
        },
    },
};

module.exports = { paths, schemas };