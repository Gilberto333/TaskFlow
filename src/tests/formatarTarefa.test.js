const { usuarios, prioridade } = require('../database/prisma')
const formatarTarefa = require('../utils/formatarTarefa')

function tarefaDoPrisma() {
    return {
        id: 1,
        texto: 'Definir tabelas do banco',
        coluna: 'afazer',
        projetos: {
            nome: 'TaskFlow'
        },
        usuarios: {
            nome: 'Ana Lima'
        },
        prioridade: {
            descricao: 'Alto',
            cor: '#EF4444'
        }
    }
}

test('achata as relações no formato que o front espera', () => {
    const resultado = formatarTarefa(tarefaDoPrisma())
    expect(resultado).toEqual({
        id: 1,
        texto: 'Definir tabelas do banco',
        coluna: 'afazer',
        projeto: 'TaskFlow',
        usuario: 'Ana Lima',
        prioridade: 'Alto',
        prioridade_cor: '#EF4444'
    });
});

test('deixa o campo undefined quando a relação não veio', () => {
    const tarefa = tarefaDoPrisma()
    delete tarefa.prioridade;
    const result = formatarTarefa(tarefa);
    expect(result.prioridade).toBeUndefined();
    expect(result.projeto).toBe('TaskFlow');
});

test('não altera a tarefa original', () => {
    const tarefa = tarefaDoPrisma()
    const result = formatarTarefa(tarefa);
    expect(result).not.toBe(tarefa);
    expect(tarefa).toHaveProperty('projetos', { nome: 'TaskFlow' });
});

test('lança typeError se receber null', () => {
    expect(() => formatarTarefa(null)).toThrow(TypeError);
});

