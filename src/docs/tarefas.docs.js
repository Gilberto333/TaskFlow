const { json, parametroId } = require('./comum');

const paths = {
    '/tarefas': {
        get: {
            tags: ['Tarefas'],
            summary: 'Lista todas as tarefas',
            responses: {
                '200': { description: 'Lista de tarefas' },
            },
        },
        post: {
            tags: ['Tarefas'],
            summary: 'Cria uma tarefa',
            requestBody: { required: true, content: json('TarefaEntrada') },
            responses: {
                '201': { description: 'Tarefa criada', content: json('Tarefa') },
                '400': { description: 'Dados inválidos', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
            },
        },
    },
    
    '/tarefas/{id}': {
        get: {
            tags: ['Tarefas'],
            summary: 'Busca uma tarefa pelo id',
            parameters: [parametroId],
            responses: {
                '200': { description: 'Tarefa encontrada', content: json('Tarefa') },
                '400': { description: 'Id inválido', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Tarefa não encontrada', content: json('Erro') },
            },
        },
        put: {
            tags: ['Tarefas'],
            summary: 'Atualiza uma tarefa',
            parameters: [parametroId],
            requestBody: { required: true, content: json('TarefaEntrada') },
            responses: {
                '200': { description: 'Tarefa atualizada com sucesso', content: json('Tarefa') },
                '400': { description: 'Dados inválidos', content: json('Erro') },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Tarefa não encontrada', content: json('Erro') },
            },
        },
        delete: {
            tags: ['Tarefas'],
            summary: 'Exclui uma tarefa',
            parameters: [parametroId],
            responses: {
                '200': {
                    description: 'Tarefa excluida',
                    content: {
                        'application/json': {
                            schema: {
                                type: 'object',
                                properties: {
                                    mensagem: { type: 'string', example: 'Tarefa removida' },
                                    tarefa: { $ref: '#/components/schemas/Tarefa' },
                                },
                            },
                        },
                    },
                },
                '401': { description: 'Token ausente ou inválido', content: json('Erro') },
                '404': { description: 'Tarefa não encontrada', content: json('Erro') },
            },
        },
    },
};

const schemas = {
    TarefaEntrada: {
        type: 'object',
        properties: {
            texto: {
                type: 'string',
                example: 'Revisar layout'
            },
            id_prioridade: {
                type: 'integer',
                example: 2,
                description: 'ID da prioridade (Padrão: 2)'
            },
            coluna: {
                type: 'string',
                enum: ['afazer', 'andamento', 'concluido'],
                example: 'afazer'
            },
            usuario_id: {
                type: 'integer',
                example: 14,
                description: 'ID do usuário responsável'
            },
            projeto_id: {
                type: 'integer',
                example: 1,
                description: 'ID do projeto associado'
            }
        },
        // Define quais campos o Swagger exige preencher para enviar a requisição
        required: ['texto', 'usuario_id', 'id_prioridade', 'projeto_id']
    },
    Tarefa: {
        type: 'object',
        properties: {
            id: { type: 'integer', example: 1 },
            texto: { type: 'string', example: 'Revisar layout' },
            id_prioridade: { type: 'integer', example: 2 },
            coluna: { type: 'string', enum: ['afazer', 'andamento', 'concluido'] },
            usuario_id: { type: 'integer', example: 14 },
            projeto_id: { type: 'integer', example: 1 },
            iniciada_em: { type: 'string', format: 'date-time', nullable: true },
            criado_em: { type: 'string', format: 'date-time' }
        }
    },
};

module.exports = { paths, schemas };