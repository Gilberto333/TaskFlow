const criarErro = require("../utils/criarErro");

function validar(schema, origem) {
  return function (req, res, next) {
    const dados = req[origem || 'body'] || {};
    const erros = [];

    for (const campo in schema) {
      const regras = schema[campo];
      const valor = dados[campo];
      const ausente = valor === undefined || valor === null || valor === "";

      // 1 — Campo obrigatório ausente
      if (regras.obrigatorio && ausente) {
        erros.push(`O campo '${campo}' é obrigatório`);
        continue;
      }

      if (ausente) continue;

      // 2 — Validação de tipo
      if (regras.tipo === 'inteiro') {
        const numero = typeof valor === 'string' ? Number(valor) :
          valor;
        if (!Number.isInteger(numero) || numero <= 0) {
          erros.push(`O campo '${campo}' deve ser um inteiro positivo`);
        }
      } else if (regras.tipo && typeof valor !== regras.tipo) {
        erros.push(`O campo '${campo}' deve ser do tipo ${regras.tipo}`);
      }

      // 3 — Valor fora dos permitidos (enum)
      if (regras.enum && !regras.enum.includes(valor)) {
        erros.push(
          `O campo '${campo}' deve ser um de: ${regras.enum.join(", ")}`,
        );
      }

        // 4 — Formato de email
        if (regras.formato === "email") {
          const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!re.test(valor))
            erros.push(`O campo '${campo}' deve ser um email válido`);
        }

        // 5 — Tamanho mínimo de texto
        if (regras.minLength && valor.length < regras.minLength)
          erros.push(
            `O campo '${campo}' deve ter ao menos ${regras.minLength} caracteres`,
          );

        // 6 — Tamanho máximo de texto
        if (regras.maxLength && valor.length > regras.maxLength)
          erros.push(
            `O campo '${campo}' deve ter no máximo ${regras.maxLength} caracteres`,
          );
      }

      if (erros.length > 0) {
        throw criarErro(400, 'Dados inválidos', erros);
      }
      next();
    };
  }

  module.exports = validar;
