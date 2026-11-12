const criarErro = require('../utils/criarErro');
const traduzirErroPrisma = require('../utils/traduzirErroPrisma');

describe('Exercício - Testes de Erros', () => {

    test('criarErro(500, "Erro interno no servidor"): o status é 500 e os detalhes ficam undefined', () => {
        const erro = criarErro(500, 'Erro interno no servidor');

        expect(erro.status).toBe(500);
        expect(erro.message).toBe('Erro interno no servidor');
        expect(erro.detalhes).toBeUndefined();
    });

    test('P2003 ao atualizar (PUT) vira 400, com a mensagem "Um dos ids informados não existe"', () => {
        const erroPrisma = { code: 'P2003' };

        const erro = traduzirErroPrisma(erroPrisma, 'PUT');

        expect(erro.status).toBe(400);
        expect(erro.message).toBe('Um dos ids informados não existe');
    });

    test('O erro do P2025 tem a mensagem "Registro não encontrado"', () => {
        const erroPrisma = { code: 'P2025' };

        const erro = traduzirErroPrisma(erroPrisma, 'PUT');

        expect(erro.message).toBe('Registro não encontrado');
    });

    test('P2003 ao excluir (DELETE) tem a mensagem "Não é possível excluir: existem registros ligados a este"', () => {
        const erroPrisma = { code: 'P2003' };

        const erro = traduzirErroPrisma(erroPrisma, 'DELETE');

        expect(erro.message).toBe('Não é possível excluir: existem registros ligados a este');
    });

});