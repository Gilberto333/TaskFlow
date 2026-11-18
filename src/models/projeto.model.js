const prisma = require('../database/prisma');

// JOIN para trazer apenas o nome do usuário dono do projeto
const incluirNomes = {
  usuarios: { select: { nome: true } },
};

// Formata o retorno para manter o contrato da API (ex: projeto.usuario)
function formatarProjeto(projeto) {
  if (!projeto) return null;

  const { usuarios, ...resto } = projeto;
  return {
    ...resto,
    usuario: usuarios?.nome,
  };
}

module.exports = {
  listar: async (filtros = {}) => {
    const where = {};

    if (filtros.descricao) {
      where.descricao = {
        contains: filtros.descricao,
        mode: 'insensitive',
      };
    }

    if (filtros.nome) {
      where.nome = {
        contains: filtros.nome,
        mode: 'insensitive',
      };
    }

    if (filtros.usuario_id) {
      where.usuario_id = Number(filtros.usuario_id);
    }

    const lista = await prisma.projetos.findMany({
      where,
      include: incluirNomes,
      orderBy: { id: 'asc' },
    });

    return lista.map(formatarProjeto);
  },

  buscar: async (id) => {
    const projeto = await prisma.projetos.findUnique({
      where: { id: Number(id) },
      include: incluirNomes,
    });

    return formatarProjeto(projeto);
  },

  adicionar: async (dados) => {
    const idUsuario = dados.usuario_id ?? dados.usuarioId;

    const novoProjeto = await prisma.projetos.create({
      data: {
        nome: dados.nome || 'Novo Projeto',
        descricao: dados.descricao,
        usuario_id: idUsuario ? Number(idUsuario) : undefined,
        criado_em: new Date(),
      },
      include: incluirNomes,
    });

    return formatarProjeto(novoProjeto);
  },

  atualizar: async (id, dados) => {
    const idNum = Number(id);

    const projetoAtual = await prisma.projetos.findUnique({
      where: { id: idNum },
    });

    if (!projetoAtual) return null;

    const idUsuario = dados.usuario_id ?? dados.usuarioId;

    const projetoAtualizado = await prisma.projetos.update({
      where: { id: idNum },
      data: {
        nome: dados.nome ?? undefined,
        descricao: dados.descricao ?? undefined,
        usuario_id: idUsuario ? Number(idUsuario) : undefined,
      },
      include: incluirNomes,
    });

    return formatarProjeto(projetoAtualizado);
  },

  remover: async (id) => {
    try {
      const projetoRemovido = await prisma.projetos.delete({
        where: { id: Number(id) },
        include: incluirNomes,
      });

      return formatarProjeto(projetoRemovido);
    } catch (error) {
      if (error.code === 'P2025') return null;
      throw error;
    }
  },
};