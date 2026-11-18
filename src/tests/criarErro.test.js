const criarErro = require('../utils/criarErro');

describe('criarErro', () => {
    test('devolve um erro com o status e a mensagem', () => {
        const erro = criarErro(404, 'Tarefa não encontrada');

        expect(erro.status).toBe(404);
        expect(erro.message).toBe('Tarefa não encontrada');

    });
    test('guarda a lista de detalhes quando informada', () => {

        // Preparar
        const detalhes = ["O campo 'texto' é obrigatório"];

        // Executar
        const erro = criarErro(400, 'Dados inválidos', detalhes);

        // Verificar
        expect(erro.detalhes[0]).toBe("O campo 'texto' é obrigatório");
    });
    test('deixa detalhes undefined quando não informado', () => {

        // Preparar e Executar
        const erro = criarErro(404, 'Tarefa não encontrada');

        // Verificar
        expect(erro.detalhes).toBeUndefined();
    });
});