const { Prisma } = require('@prisma/client');
const traduzirErroPrisma = require('../utils/traduzirErroPrisma');

function tratarErros(erro, req, res, next) {
    if (erro instanceof Prisma.PrismaClientKnownRequestError) {
        erro = traduzirErroPrisma(erro, req.method);
    }

    const status = erro.status || 500;
    console.error('[ERRO]', req.method, req.url, erro.message);

    const mensagem = status === 500
        ? 'Erro interno no servidor'
        : erro.message;

    res.status(status).json({ 
        erro: { mensagem, detalhes: erro.detalhes } 
    });
}

module.exports = tratarErros;