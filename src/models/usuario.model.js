const prisma = require('../database/prisma');

// Seleção de campos seguros para não expor a senha_hash
const camposSeguros = {
  id: true,
  nome: true,
  email: true,
  criado_em: true,
};

module.exports = {
  listar: async (filtros = {}) => {
    const where = {};

    if (filtros.nome) {
      where.nome = {
        contains: filtros.nome,
        mode: 'insensitive', // Equivale ao ILIKE
      };
    }

    if (filtros.email) {
      where.email = filtros.email;
    }

    const lista = await prisma.usuarios.findMany({
      where,
      select: camposSeguros,
      orderBy: { id: 'asc' },
    });

    return lista;
  },

  buscar: async (id) => {
    const usuario = await prisma.usuarios.findUnique({
      where: { id: Number(id) },
      select: camposSeguros,
    });

    return usuario;
  },

  buscarPorEmail: async (email) => {
    // Traz a senha_hash para permitir a verificação de login/autenticação no controller
    const usuario = await prisma.usuarios.findUnique({
      where: { email },
    });

    return usuario;
  },

  adicionar: async (dados) => {
    const hashParaSalvar = dados.senha_hash || dados.senha || '1234';

    const novoUsuario = await prisma.usuarios.create({
      data: {
        nome: dados.nome,
        email: dados.email,
        senha_hash: hashParaSalvar,
        criado_em: new Date(),
      },
      select: camposSeguros,
    });

    return novoUsuario;
  },

  atualizar: async (id, dados) => {
    const idNum = Number(id);

    // 1. Verifica se o usuário existe
    const usuarioAtual = await prisma.usuarios.findUnique({
      where: { id: idNum },
    });

    if (!usuarioAtual) return null;

    const hashParaSalvar = dados.senha_hash || dados.senha;

    // 2. Atualiza os dados usando undefined para campos não informados (mantém o valor atual)
    const usuarioAtualizado = await prisma.usuarios.update({
      where: { id: idNum },
      data: {
        nome: dados.nome ?? undefined,
        email: dados.email ?? undefined,
        senha_hash: hashParaSalvar ?? undefined,
      },
      select: camposSeguros,
    });

    return usuarioAtualizado;
  },

  remover: async (id) => {
    try {
      const usuarioRemovido = await prisma.usuarios.delete({
        where: { id: Number(id) },
        select: {
          id: true,
          nome: true,
          email: true,
        },
      });

      return usuarioRemovido;
    } catch (error) {
      if (error.code === 'P2025') return null;
      throw error;
    }
  },
};