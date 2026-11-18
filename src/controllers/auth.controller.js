const jwt = require('jsonwebtoken');
const usuarioModel = require('../models/usuario.model');
const criarErro = require('../utils/criarErro');

const authController = {
  async login(req, res) {
    const { email, senha } = req.body;

    // Validação básica
    if (!email || !senha) {
      throw criarErro(400, "Email e senha são obrigatórios");
    }

    // 1. Verificar se o usuário existe na base de dados
    const usuario = await usuarioModel.buscarPorEmail(email);

    if (!usuario) {
      throw criarErro(401, "Credenciais inválidas");
    }

    // 2. Verificar a senha (comparação com a coluna senha_hash da base de dados)
    if (usuario.senha_hash !== senha) {
      throw criarErro(401, "Credenciais inválidas");
    }

    // 3. Gerar o token JWT
    const token = jwt.sign(
      { id: usuario.id, nome: usuario.nome },
      process.env.JWT_SECRET || 'chave_secreta_padrao',
      { expiresIn: "8h" }
    );

    // 4. Retornar token e dados públicos
    return res.json({
      token,
      usuario: { id: usuario.id, nome: usuario.nome }
    });
  },
};

module.exports = authController;