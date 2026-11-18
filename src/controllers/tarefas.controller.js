const tarefaModel = require("../models/tarefa.model");
const usuarioModel = require("../models/usuario.model");
const criarErro = require("../utils/criarErro");

const PRIORIDADES_VALIDAS = ["alta", "media", "baixa"];

const PRIORIDADE_IDS = {
  baixa: 3,
  media: 5,
  alta: 6,
};

const COLUNAS_VALIDAS = ["afazer", "andamento", "concluido"];

const tarefasController = {
  async listar(req, res) {
    const resultado = await tarefaModel.listar(req.query);
    return res.json(resultado);
  },

  async buscarPorId(req, res) {
    const id = parseInt(req.params.id, 10);
    const tarefa = await tarefaModel.buscar(id);

    if (!tarefa) {
      throw criarErro(404, "Tarefa não encontrada");
    }

    return res.json(tarefa);
  },

  async criar(req, res) {
    const {
      texto,
      prioridade,
      coluna,
      projetoId,
      projeto_id
    } = req.body;

    const usuarioId = req.usuario.id;
    const id_prioridade = PRIORIDADE_IDS[prioridade || "media"];
    const colunaFinal = coluna || "afazer";

    if (colunaFinal === "andamento") {
      const totalAndamento = await tarefaModel.contarPorUsuarioEColuna(
        usuarioId,
        "andamento"
      );

      if (totalAndamento >= 2) {
        throw criarErro(400, "Limite de 2 tarefas em andamento por usuário atingido");
      }
    }

    const tarefa = await tarefaModel.adicionar({
      texto,
      id_prioridade,
      coluna: colunaFinal,
      usuarioId,
      projetoId: projetoId ?? projeto_id,
    });

    return res.status(201).json(tarefa);
  },

  async atualizar(req, res) {
    const id = parseInt(req.params.id, 10);
    const { texto, prioridade, coluna, usuarioId, usuario_id, projetoId, projeto_id, id_prioridade, idprioridade } = req.body;

    if (prioridade && !PRIORIDADES_VALIDAS.includes(prioridade)) {
      throw criarErro(400, "Prioridade inválida. Use: alta, media ou baixa");
    }

    if (coluna && !COLUNAS_VALIDAS.includes(coluna)) {
      throw criarErro(400, "Coluna inválida. Use: afazer, andamento ou concluido");
    }

    const tarefaAtual = await tarefaModel.buscar(id);
    if (!tarefaAtual) {
      throw criarErro(404, "Tarefa não encontrada");
    }

    const idUsuarioEfetivo = (usuarioId || usuario_id)
      ? parseInt(usuarioId || usuario_id, 10)
      : tarefaAtual.usuario_id;

    const novaColuna = coluna || tarefaAtual.coluna;

    if (idUsuarioEfetivo && novaColuna === "andamento" && tarefaAtual.coluna !== "andamento") {
      const totalAndamento = await tarefaModel.contarPorUsuarioEColuna(idUsuarioEfetivo, "andamento");
      if (totalAndamento >= 2) {
        throw criarErro(400, "Limite de 2 tarefas em andamento por usuário atingido");
      }
    }

    const idPrioridadeEfetivo = (prioridade && PRIORIDADE_IDS[prioridade])
      ? PRIORIDADE_IDS[prioridade]
      : (id_prioridade || idprioridade || tarefaAtual.id_prioridade);

    const dadosParaAtualizar = {
      texto: texto !== undefined ? texto : tarefaAtual.texto,
      coluna: novaColuna,
      usuario_id: idUsuarioEfetivo,
      projeto_id: projetoId ?? projeto_id ?? tarefaAtual.projeto_id,
      id_prioridade: idPrioridadeEfetivo
    };

    const atualizada = await tarefaModel.atualizar(id, dadosParaAtualizar);
    return res.json(atualizada);
  },

  async remover(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw criarErro(400, "ID inválido");
    }

    const removida = await tarefaModel.remover(id);

    if (!removida) {
      throw criarErro(404, "Tarefa não encontrada");
    }

    return res.json({ mensagem: "Tarefa removida com sucesso", tarefa: removida });
  },

  async estatisticas(req, res) {
    const dadosEstatistcos = await tarefaModel.obterEstatisticas(req.query.coluna);
    return res.json(dadosEstatistcos);
  },
};

module.exports = tarefasController;