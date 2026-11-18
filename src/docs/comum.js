const json = (nome) => ({
    'application/json': { schema: { $ref: `#/components/schemas/${nome}` } },
});

const parametroId = {
    name: 'id', in: 'path', required: true,
    schema: { type: 'integer', example: 1 }
};

const schemas = {
    Erro: {
        type: 'object', properties: {
            erro: {
                type: 'object', properties: { 
                    mensagem: { type: 'string', example: 'Tarefa não encontrada' },
                    detalhes: { type: 'array', items: { type: 'string' } },
                }
            }
        }
    },
};

module.exports = { json, parametroId, schemas };