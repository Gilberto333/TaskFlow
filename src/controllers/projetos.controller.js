const projetoModel = require("../models/projeto.model");
const criarErro = require("../utils/criarErro");

const projetosController = {
  async listar(req, res) {
    const { usuario_id, usuarioId } = req.query;
    const idParaFiltrar = usuario_id || usuarioId;

    // Validação do filtro de usuário se for enviado na query string
    if (idParaFiltrar !== undefined) {
      const idParsed = parseInt(idParaFiltrar, 10);
      if (isNaN(idParsed)) {
        throw criarErro(400, "O parâmetro de filtro 'usuario_id' deve ser um número válido");
      }
    }

    const resposta = await projetoModel.listar(req.query);
    return res.json(resposta);
  },

  async buscarPorId(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw criarErro(400, "ID de projeto inválido");
    }

    const projeto = await projetoModel.buscar(id);

    if (!projeto) {
      throw criarErro(404, "Projeto não encontrado");
    }

    return res.json(projeto);
  },

  async criar(req, res) {
    const { nome, descricao, usuario_id, usuarioId } = req.body;
    const idUsuario = req.usuario?.id ?? usuario_id ?? usuarioId;

    if (!nome) {
      throw criarErro(400, "O nome do projeto é obrigatório");
    }

    const novoProjeto = await projetoModel.adicionar({
      nome,
      descricao,
      usuario_id: idUsuario,
    });

    return res.status(201).json(novoProjeto);
  },

  async atualizar(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw criarErro(400, "ID de projeto inválido");
    }

    const projetoAtual = await projetoModel.buscar(id);
    if (!projetoAtual) {
      throw criarErro(404, "Projeto não encontrado");
    }

    const projetoAtualizado = await projetoModel.atualizar(id, req.body);
    return res.json(projetoAtualizado);
  },

  async remover(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw criarErro(400, "ID de projeto inválido");
    }

    const removido = await projetoModel.remover(id);

    if (!removido) {
      throw criarErro(404, "Projeto não encontrado");
    }

    return res.json({ mensagem: "Projeto removido com sucesso", id });
  },
};

module.exports = projetosController;