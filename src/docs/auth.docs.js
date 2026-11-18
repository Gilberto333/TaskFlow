const { json } = require('./comum');

const paths = {
    '/auth/login': {
        post: {
            tags: ['Autenticação'],
            summary: 'Autentica um usuário e retorna o token JWT',
            security: [], // Rota pública
            requestBody: { required: true, content: json('LoginEntrada') },
            responses: {
                '200': { description: 'Login efetuado com sucesso', content: json('LoginResposta') },
                '400': { description: 'E-mail e senha são obrigatórios', content: json('Erro') },
                '401': { description: 'Credenciais inválidas', content: json('Erro') },
            },
        },
    },
};

const schemas = {
    LoginEntrada: {
        type: 'object',
        properties: {
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
        required: ['email', 'senha'],
    },
    LoginResposta: {
        type: 'object',
        properties: {
            token: {
                type: 'string',
                example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
            },
            usuario: {
                type: 'object',
                properties: {
                    id: { type: 'integer', example: 1 },
                    nome: { type: 'string', example: 'Maria Silva' },
                },
            },
        },
    },
};

module.exports = { paths, schemas };