import { useState, useEffect } from "react";
import axios from "axios";
import styles from "./modal.module.css";

function Modal({
  aberto,
  fechar,
  salvar,
  tarefaInicial
}) {

  const [texto, setTexto] = useState("");
  const [prioridade, setPrioridade] = useState("media");
  const [cep, setCep] = useState("");
  const [cidade, setCidade] = useState("");

  useEffect(() => {
    if (tarefaInicial) {
      setTexto(tarefaInicial.texto);
      setPrioridade(tarefaInicial.prioridade);
      setCep(tarefaInicial.cep || "");
      setCidade(tarefaInicial.cidade || "");
    }
  }, [tarefaInicial]);

  useEffect(() => {

    const fecharEsc = (e) => {
      if (e.key === "Escape") {
        fechar();
      }
    };

    window.addEventListener("keydown", fecharEsc);

    return () => {
      window.removeEventListener("keydown", fecharEsc);
    };

  }, [fechar]);

  const buscarCidade = async (valorCep) => {

    const cepLimpo = valorCep.replace(/\D/g, "");

    if (cepLimpo.length !== 8) {
      setCidade("");
      return;
    }

    try {

      const response = await axios.get(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );

      if (!response.data.erro) {
        setCidade(
          `${response.data.localidade} - ${response.data.uf}`
        );
      }

    } catch {
      setCidade("");
    }

  };

  const alterarCep = (e) => {
    setCep(e.target.value);
    buscarCidade(e.target.value);
  };

  const enviar = (e) => {
    e.preventDefault();

    salvar({
      ...tarefaInicial,
      texto,
      prioridade,
      cep,
      cidade
    });
  };

  if (!aberto) return null;

  return (

    <div
      className={styles.overlay}
      onClick={fechar}
    >

      <div
        className={styles.modal}
        onClick={(e) => e.stopPropagation()}
      >

        <h2>
          {tarefaInicial.id ? "Editar tarefa" : "Nova tarefa"}
        </h2>

        <form onSubmit={enviar}>

          <input
            type="text"
            placeholder="Nome da tarefa"
            value={texto}
            onChange={(e) => setTexto(e.target.value)}
            required
          />

          <select
            value={prioridade}
            onChange={(e) => setPrioridade(e.target.value)}
          >
            <option value="alta">Alta</option>
            <option value="media">Média</option>
            <option value="baixa">Baixa</option>
          </select>

          <input
            type="text"
            placeholder="CEP"
            value={cep}
            maxLength={8}
            onChange={alterarCep}
          />

          <input
            type="text"
            value={cidade}
            readOnly
            placeholder="Cidade"
          />

          <div className={styles.botoes}>
            <button
              type="button"
              onClick={fechar}
            >
              Cancelar
            </button>

            <button type="submit">
              Salvar
            </button>
          </div>

        </form>

      </div>

    </div>

  );

}

export default Modal;