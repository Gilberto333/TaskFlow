const validar = require('../middlewares/validar');
const schemas = require('../middlewares/schemas');

function pegarErro(funcao) {
    try {
        funcao();
    } catch (erro) {
        return erro;
    }
}

function tarefaValida() {

    return {
        texto: 'Revisar o plano de teste',
        coluna: 'afazer',
        usuario_id: 1,
        projeto_id: 1,
        id_prioridade: 2
    };
}

describe('validar', () => {
    test('chama o next quando os dados estão certos', () => {

        const middleware = validar(schemas.tarefa);
        const req = { body: tarefaValida() };
        const next = jest.fn();

        middleware(req, {}, next);

        expect(next).toHaveBeenCalledTimes(1);
        expect(next).toHaveBeenCalledWith();

    });
    test('sem body: 400 com um detalhe por campo obrigatório', () => {

        const middleware = validar(schemas.tarefa);
        const req = {};
        const next = jest.fn();
        const erro = pegarErro(() => middleware(req, {}, next));

        expect(erro.status).toBe(400);
        expect(erro.message).toBe('Dados inválidos');
        expect(erro.detalhes).toEqual([
            "O campo 'texto' é obrigatório",
            "O campo 'coluna' é obrigatório",
            "O campo 'usuario_id' é obrigatório",
            "O campo 'projeto_id' é obrigatório",
            "O campo 'id_prioridade' é obrigatório",
        ]);

        expect(next).not.toHaveBeenCalled();

    });
    test('coluna fora da lista: diz os valores aceitos', () => {

        const middleware = validar(schemas.tarefa);
        const req = { body: { ...tarefaValida(), coluna: 'feito' } };
        const next = jest.fn();
        const erro = pegarErro(() => middleware(req, {}, next));

        expect(erro.detalhes).toEqual([
            "O campo 'coluna' deve ser um de: afazer, andamento, concluido",
        ]);

        expect(next).not.toHaveBeenCalled();

    });
    test('id da URL: aceita "7" e barra "abc"', () => {

        const middleware = validar(schemas.id, 'params');
        const nextBom = jest.fn();
        const nextRuim = jest.fn();

        middleware({ params: { id: '7' } }, {}, nextBom);

        const erro = pegarErro(() =>

            middleware({ params: { id: 'abc' } }, {}, nextRuim));

        expect(nextBom).toHaveBeenCalledTimes(1);
        expect(erro.detalhes).toEqual([
            "O campo 'id' deve ser um inteiro positivo",
        ]);

        expect(nextRuim).not.toHaveBeenCalled();

    });
    test('campo opcional não enviado não gera erro', () => {

        const middleware = validar(schemas.projeto);
        const req = { body: { nome: 'TaskFlow' } };
        const next = jest.fn();

        middleware(req, {}, next);

        expect(next).toHaveBeenCalledTimes(1);

    });

});