const prisma = require('../database/prisma');

const prioridadeModel = {
    listar: async () => {
        const prioridades = await prisma.prioridades.findMany({
            select: {
                id: true,
                descricao: true,
                ativo: true,
            },
            orderBy: {
                id: 'asc',
            },
        });

        return prioridades;
    },
};

module.exports = prioridadeModel;