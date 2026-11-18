const prisma = require('../database/prisma');

const incluirNomes = {
  projetos: { select: { nome: true } },
  usuarios: { select: { nome: true } },
  prioridades: { select: { descricao: true } },
};

function formatarTarefa(tarefa) {
  if (!tarefa) return null;
  const { projetos, usuarios, prioridades, ...resto } = tarefa;
  return {
    ...resto,
    projeto: projetos?.nome,
    usuario: usuarios?.nome,
    prioridade: prioridades?.descricao,
  };
}

function extrairId(...candidatos) {
  for (const val of candidatos) {
    if (val !== undefined && val !== null && val !== '' && typeof val !== 'boolean') {
      const num = Number(val);
      if (!isNaN(num) && num > 0) return num;
    }
  }
  return null;
}

async function resolverPrioridadeId(dados) {
  const bruto =
    dados.prioridade_id ??
    dados.idprioridade ??
    dados.prioridadeId ??
    dados.prioridade;

  if (bruto === undefined || bruto === null || bruto === '' || typeof bruto === 'boolean') {
    return null;
  }

  if (!isNaN(Number(bruto))) {
    const num = Number(bruto);
    return num > 0 ? num : null;
  }

  if (typeof bruto === 'string') {
    const normalizar = (str) =>
      str
        .trim()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

    const alvo = normalizar(bruto);
    const prioridades = await prisma.prioridades.findMany();
    const encontrada = prioridades.find(
      (p) => p.descricao && normalizar(p.descricao) === alvo
    );

    if (encontrada) {
      return encontrada.id;
    }

    if (['baixa', 'media', 'alta'].includes(alvo)) {
      try {
        const nova = await prisma.prioridades.create({
          data: { descricao: alvo },
        });
        return nova.id;
      } catch (e) {
        console.error('Erro ao criar prioridade automaticamente:', e.message);
      }
    }
  }

  return null;
}

const tarefaModel = {
  listar: async () => {
    const lista = await prisma.tarefas.findMany({
      include: incluirNomes,
      orderBy: { id: 'asc' },
    });
    return lista.map(formatarTarefa);
  },

  buscar: async (id) => {
    const tarefa = await prisma.tarefas.findUnique({
      where: { id: Number(id) },
      include: incluirNomes,
    });
    return tarefa ? formatarTarefa(tarefa) : null;
  },

  adicionar: async (dados) => {
    const idPrioridade = await resolverPrioridadeId(dados);
    const idProjeto = extrairId(dados.projeto_id, dados.idprojeto, dados.projetoId, dados.projeto);
    const idUsuario = extrairId(dados.usuario_id, dados.idusuario, dados.usuarioId, dados.usuario);

    if (!idProjeto) {
      throw new Error("O campo projeto_id é obrigatório.");
    }
    if (!idUsuario) {
      throw new Error("O campo usuario_id é obrigatório.");
    }
    if (!idPrioridade) {
      throw new Error("O campo prioridade_id (ou prioridade válida) é obrigatório.");
    }

    const dataPayload = {
      texto: dados.texto,
      coluna: dados.coluna || 'afazer',
      ordem: Number(dados.ordem) || 0,
      prioridades: {
        connect: { id: idPrioridade },
      },
      projetos: {
        connect: { id: idProjeto },
      },
      usuarios: {
        connect: { id: idUsuario },
      },
    };

    try {
      const tarefa = await prisma.tarefas.create({
        data: dataPayload,
        include: incluirNomes,
      });
      return formatarTarefa(tarefa);
    } catch (erro) {
      if (erro.code === 'P2025') {
        throw new Error("O projeto, usuário ou prioridade informado não existe no banco de dados.");
      }
      throw erro;
    }
  },

  atualizar: async (id, dados) => {
    const idNum = Number(id);
    const atual = await prisma.tarefas.findUnique({ where: { id: idNum } });
    if (!atual) return null;

    let iniciadaEm = atual.iniciada_em;
    let concluidaEm = atual.concluida_em;

    if (dados.coluna === 'andamento' && !atual.iniciada_em) {
      iniciadaEm = new Date();
    }
    if (dados.coluna === 'concluido' && !atual.concluida_em) {
      concluidaEm = new Date();
    }

    const dataPayload = {
      texto: dados.texto !== undefined ? dados.texto : atual.texto,
      coluna: dados.coluna !== undefined ? dados.coluna : atual.coluna,
      iniciada_em: iniciadaEm,
      concluida_em: concluidaEm,
    };

    const idPrioridade = await resolverPrioridadeId(dados);
    const idProjeto = extrairId(dados.projeto_id, dados.idprojeto, dados.projetoId, dados.projeto);
    const idUsuario = extrairId(dados.usuario_id, dados.idusuario, dados.usuarioId, dados.usuario);

    if (idPrioridade) {
      dataPayload.prioridades = { connect: { id: idPrioridade } };
    }
    if (idProjeto) {
      dataPayload.projetos = { connect: { id: idProjeto } };
    }
    if (idUsuario) {
      dataPayload.usuarios = { connect: { id: idUsuario } };
    }

    try {
      const tarefa = await prisma.tarefas.update({
        where: { id: idNum },
        data: dataPayload,
        include: incluirNomes,
      });
      return formatarTarefa(tarefa);
    } catch (erro) {
      if (erro.code === 'P2025') {
        throw new Error("O relacionamento informado (projeto, usuário ou prioridade) não existe.");
      }
      throw erro;
    }
  },

  remover: async (id) => {
    try {
      const tarefa = await prisma.tarefas.delete({
        where: { id: Number(id) },
        include: incluirNomes,
      });
      return formatarTarefa(tarefa);
    } catch (erro) {
      if (erro.code === 'P2025') return null;
      throw erro;
    }
  },

  contarPorUsuario: async (idUsuario) => {
    const idNum = Number(idUsuario);
    if (!idNum || isNaN(idNum)) return 0;
    return await prisma.tarefas.count({
      where: {
        usuarios: { id: idNum },
      },
    });
  },

  contarPorUsuarioEColuna: async (idUsuario, coluna) => {
    const idNum = Number(idUsuario);
    if (!idNum || isNaN(idNum)) return 0;
    return await prisma.tarefas.count({
      where: {
        usuarios: { id: idNum },
        coluna: coluna,
      },
    });
  },

  obterEstatisticas: async (coluna) => {
    if (coluna) {
      const total = await prisma.tarefas.count({ where: { coluna } });
      return { coluna, total };
    }

    const [total, afazer, andamento, concluido] = await Promise.all([
      prisma.tarefas.count(),
      prisma.tarefas.count({ where: { coluna: 'afazer' } }),
      prisma.tarefas.count({ where: { coluna: 'andamento' } }),
      prisma.tarefas.count({ where: { coluna: 'concluido' } }),
    ]);

    return { total, afazer, andamento, concluido };
  },
};

module.exports = tarefaModel;