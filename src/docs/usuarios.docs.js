const { json, parametroId } = require('./comum');

const paths = {
    '/usuarios': {
        get: {
            tags: ['Usuários'],
            summary: 'Lista todos os usuários',
            responses: {
                '200': { description: 'Lista de usuários obtida com sucesso' },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
            },
        },
        post: {
            tags: ['Usuários'],
            summary: 'Cria um novo usuário',
            requestBody: { required: true, content: json('UsuarioEntrada') },
            responses: {
                '201': { description: 'Usuário criado com sucesso', content: json('Usuario') },
                '400': { description: 'Dados inválidos ou e-mail já cadastrado', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
            },
        },
    },

    '/usuarios/{id}': {
        get: {
            tags: ['Usuários'],
            summary: 'Busca um usuário pelo id',
            parameters: [parametroId],
            responses: {
                '200': { description: 'Usuário encontrado', content: json('Usuario') },
                '400': { description: 'Id de usuário inválido', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Usuário não encontrado', content: json('Erro') },
            },
        },
        put: {
            tags: ['Usuários'],
            summary: 'Atualiza um usuário',
            parameters: [parametroId],
            requestBody: { required: true, content: json('UsuarioEntrada') },
            responses: {
                '200': { description: 'Usuário atualizado com sucesso', content: json('Usuario') },
                '400': { description: 'Dados inválidos ou e-mail já em uso', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Usuário não encontrado', content: json('Erro') },
            },
        },
        delete: {
            tags: ['Usuários'],
            summary: 'Exclui um usuário',
            parameters: [parametroId],
            responses: {
                '200': {
                    description: 'Usuário removido com sucesso',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    mensagem: { type: 'string', example: 'Usuário removido com sucesso' },
                                    id: { type: 'integer', example: 1 },
                                },
                            },
                        },
                    },
                },
                '400': { description: 'Id inválido ou usuário possui tarefas vinculadas', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Usuário não encontrado', content: json('Erro') },
            },
        },
    },
};

const schemas = {
    UsuarioEntrada: {
        type: 'object',
        properties: {
            nome: {
                type: 'string',
                example: 'Maria Silva',
            },
            email: {
                type: 'string',
                format: 'email',
                example: 'maria.silva@email.com',
            },
            senha: {
                type: 'string',
                format: 'password',
                example: '123456',
            },
        },
        required: ['nome', 'email', 'senha'],
    },
    Usuario: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            nome: { type: 'string', example: 'Maria Silva' },
            email: { type: 'string', example: 'maria.silva@email.com' },
            criado_em: { type: 'string', format: 'date-time' },
        },
    },
};

module.exports = { paths, schemas };