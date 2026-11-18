const tarefas = [];

function listarTodas() {
  return tarefas;
}

function buscarPorId(id) {
  return tarefas.find((t) => t.id === id);
}

function adicionar(tarefa) {
  tarefas.push(tarefa);

  return tarefa;
}


module.exports = { listarTodas, buscarPorId, adicionar };
