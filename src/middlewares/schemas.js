const schemas = {
  id: {
    id: { obrigatorio: true, tipo: "inteiro" },
  },

  tarefa: {
    texto: { obrigatorio: true, tipo: "string" },
    coluna: { obrigatorio: true, tipo: "string",
      enum: ["afazer", "andamento", "concluido"]},
    usuario_id: { obrigatorio: true, tipo: "inteiro" },
    projeto_id: { obrigatorio: true, tipo: "inteiro" },
    id_prioridade: { obrigatorio: true, tipo: "inteiro"},

    prioridade: {
      obrigatorio: false,
      tipo: "string",
      enum: ["alta", "media", "baixa"],
    },
   
  },

  usuario: {
    nome: { obrigatorio: true, tipo: "string", minLength: 3 },
    email: { obrigatorio: true, tipo: "string", formato: "email" },
    senha: { obrigatorio: true, tipo: "string", minLength: 6 },
  },

  projeto: {
    nome: { obrigatorio: true, tipo: "string" },
    descricao: { obrigatorio: false, tipo: "string", maxLength: 200 },
  },
};

module.exports = schemas;