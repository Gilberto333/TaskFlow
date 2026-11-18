function formatarTarefa(tarefa) {
    if (!tarefa || typeof tarefa !== 'object') {
        throw new TypeError('Tarefa inválida');
    }

    const { projetos, usuarios, prioridades, prioridade, ...resto } = tarefa;
    const relacaoPrioridade = prioridades || prioridade;

    return {
        ...resto,
        projeto: projetos?.nome,
        usuario: usuarios?.nome,
        prioridade: relacaoPrioridade?.descricao,
        prioridade_cor: relacaoPrioridade?.cor,
    };
}

module.exports = formatarTarefa;