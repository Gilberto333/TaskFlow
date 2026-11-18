const usuarioModel = require("../models/usuario.model");
const tarefaModel = require("../models/tarefa.model");
const criarErro = require("../utils/criarErro");

const usuariosController = {
  async listar(req, res) {
    const resultado = await usuarioModel.listar(req.query);
    return res.json(resultado);
  },

  async buscarPorId(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw criarErro(400, "ID de usuário inválido");
    }

    const usuario = await usuarioModel.buscar(id);

    if (!usuario) {
      throw criarErro(404, "Usuário não encontrado");
    }

    return res.json(usuario);
  },

  async criar(req, res) {
    const { nome, email, senha, senha_hash } = req.body;

    if (!email) {
      throw criarErro(400, "O e-mail é obrigatório");
    }

    if (!nome) {
      throw criarErro(400, "O nome é obrigatório");
    }

    const usuarioExistente = await usuarioModel.buscarPorEmail(email);
    if (usuarioExistente) {
      throw criarErro(400, "Este email já está cadastrado");
    }

    const novoUsuario = await usuarioModel.adicionar({
      nome,
      email,
      senha,
      senha_hash,
    });

    return res.status(201).json(novoUsuario);
  },

  async atualizar(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw criarErro(400, "ID de usuário inválido");
    }

    const usuarioAtual = await usuarioModel.buscar(id);
    if (!usuarioAtual) {
      throw criarErro(404, "Usuário não encontrado");
    }

    if (req.body.email && req.body.email !== usuarioAtual.email) {
      const emailEmUso = await usuarioModel.buscarPorEmail(req.body.email);
      if (emailEmUso) {
        throw criarErro(400, "Este email já está em uso por outro usuário");
      }
    }

    const usuarioAtualizado = await usuarioModel.atualizar(id, req.body);
    return res.json(usuarioAtualizado);
  },

  async remover(req, res) {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw criarErro(400, "ID de usuário inválido");
    }

    const usuario = await usuarioModel.buscar(id);
    if (!usuario) {
      throw criarErro(404, "Usuário não encontrado");
    }

    // Verifica se existem tarefas atreladas ao usuário antes de remover
    const qtdTarefas = await tarefaModel.contarPorUsuario(id);

    if (qtdTarefas > 0) {
      throw criarErro(400, "Usuário possui tarefas. Remova as tarefas antes.");
    }

    await usuarioModel.remover(id);

    return res.json({ mensagem: "Usuário removido com sucesso", id });
  },
};

module.exports = usuariosController;