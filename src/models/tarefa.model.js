const prisma = require('../database/prisma');
const formatarTarefa = require('../utils/formatarTarefa');

// os três JOINs: nome/descrição e cor da prioridade
const incluirNomes = {
  projetos: { select: { nome: true } },
  usuarios: { select: { nome: true } },
  prioridades: { select: { descricao: true, cor: true } },
};

module.exports = {
  listar: async (query = {}) => {
    // Monta os filtros dinamicamente para o Prisma
    const where = {};

    if (query.coluna) {
      where.coluna = query.coluna;
    }
    if (query.id_prioridade) {
      where.id_prioridade = Number(query.id_prioridade);
    }
    if (query.usuario_id) {
      where.usuario_id = Number(query.usuario_id);
    }

    // Busca no Prisma com filtros, includes e ordenação
    const lista = await prisma.tarefas.findMany({
      where,
      include: incluirNomes,
      orderBy: { id: 'asc' },
    });

    // Mapeia o resultado aplicando a formatação
    return lista.map(formatarTarefa);
  },

  buscar: async (id) => {
    const tarefa = await prisma.tarefas.findUnique({
      where: { id: Number(id) },
      include: incluirNomes,
    });

    return tarefa ? formatarTarefa(tarefa) : null;
  },

  contarPorUsuarioEColuna: async (usuarioId, coluna) => {
    const total = await prisma.tarefas.count({
      where: {
        usuario_id: Number(usuarioId),
        coluna: coluna,
      },
    });

    return total;
  },

  adicionar: async (dados) => {
    const colunaFinal = dados.coluna || 'afazer';
    const agora = new Date();

    const iniciadaEm = colunaFinal === 'andamento' ? agora : null;
    const concluidaEm = colunaFinal === 'concluido' ? agora : null;

    const novaTarefa = await prisma.tarefas.create({
      data: {
        texto: dados.texto,
        id_prioridade: Number(dados.id_prioridade ?? dados.idPrioridade) || 2,
        coluna: colunaFinal,
        usuario_id: Number(dados.usuario_id ?? dados.usuarioId),
        projeto_id: Number(dados.projeto_id ?? dados.projetoId),
        criado_em: agora,
        iniciada_em: iniciadaEm,
        concluida_em: concluidaEm,
      },
      include: incluirNomes,
    });

    return formatarTarefa(novaTarefa);
  },

  atualizar: async (id, dados) => {
    const idNum = Number(id);

    // 1. Busca a tarefa atual para verificar existência e transições de estado
    const tarefaAtual = await prisma.tarefas.findUnique({
      where: { id: idNum },
    });

    if (!tarefaAtual) return null;

    // 2. Regras de atualização de datas de status
    const concluidaEm = dados.coluna === 'concluido' ? new Date() : null;
    let iniciadaEm = tarefaAtual.iniciada_em;

    if (tarefaAtual.coluna === 'andamento' && dados.coluna === 'afazer') {
      iniciadaEm = null;
    } else if (tarefaAtual.coluna === 'afazer' && dados.coluna === 'andamento') {
      iniciadaEm = new Date();
    }

    // 3. Atualização no banco via Prisma
    const tarefaAtualizada = await prisma.tarefas.update({
      where: { id: idNum },
      data: {
        texto: dados.texto,
        coluna: dados.coluna,
        usuario_id: Number(dados.usuario_id ?? dados.usuarioId),
        projeto_id: Number(dados.projeto_id ?? dados.projetoId),
        id_prioridade: Number(dados.id_prioridade ?? dados.idPrioridade) || 2,
        concluida_em: concluidaEm,
        iniciada_em: iniciadaEm,
      },
      include: incluirNomes,
    });

    return formatarTarefa(tarefaAtualizada);
  },

  remover: async (id) => {
    try {
      const resultado = await prisma.tarefas.delete({
        where: { id: Number(id) },
        include: incluirNomes, // Garante que trará os relacionamentos para formatar
      });

      return formatarTarefa(resultado);
    } catch (error) {
      if (error.code === 'P2025') return null;
      throw error;
    }
  },

  obterEstatisticas: async (colunaFiltro) => {
    const where = {};
    if (colunaFiltro) {
      where.coluna = colunaFiltro;
    }

    // Otimização: traz apenas as colunas necessárias para os cálculos
    const rows = await prisma.tarefas.findMany({
      where,
      select: {
        coluna: true,
        id_prioridade: true,
      },
    });

    const total = rows.length;

    const porColuna = {
      afazer: rows.filter((t) => (t.coluna || 'afazer') === 'afazer').length,
      andamento: rows.filter((t) => t.coluna === 'andamento').length,
      concluido: rows.filter((t) => t.coluna === 'concluido').length,
    };

    const porPrioridade = {
      alta: rows.filter((t) => t.id_prioridade === 6).length,
      media: rows.filter((t) => t.id_prioridade === 5).length,
      baixa: rows.filter((t) => t.id_prioridade === 3).length,
    };

    const colunaMaisTarefas =
      Object.entries(porColuna).sort((a, b) => b[1] - a[1])[0]?.[0] || 'afazer';

    return {
      total,
      porColuna,
      porPrioridade,
      colunaMaisTarefas,
    };
  },
};