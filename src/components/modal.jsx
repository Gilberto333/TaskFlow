import { useState, useEffect } from "react";

import api from "../api";
import styles from "./modal.module.css";

function Modal({
  aberto,
  fechar,
  salvar,
  tarefaInicial
}) {
  const [texto, setTexto] = useState("");
  const [prioridade, setPrioridade] = useState("media");

  
  const [projetos, setProjetos] = useState([]);
  const [projetoId, setProjetoId] = useState("");
  const [exibirFormNovoProjeto, setExibirFormNovoProjeto] = useState(false);
  const [nomeNovoProjeto, setNomeNovoProjeto] = useState("");

 
  const carregarProjetos = async () => {
    try {
      const response = await api.get('/projetos');
      setProjetos(response.data || []);
    } catch (error) {
      console.error("Erro ao carregar projetos:", error);
    }
  };

  useEffect(() => {
    if (aberto) {
      carregarProjetos();
    }
  }, [aberto]);

  useEffect(() => {
    if (tarefaInicial) {
      setTexto(tarefaInicial.texto || "");
      setPrioridade(tarefaInicial.prioridade || "media");
    
      setProjetoId(tarefaInicial.projeto_id || tarefaInicial.projetoId || "");
    }
  }, [tarefaInicial]);

  useEffect(() => {
    const fecharEsc = (e) => {
      if (e.key === "Escape") {
        fechar();
        setExibirFormNovoProjeto(false);
      }
    };

    window.addEventListener("keydown", fecharEsc);
    return () => {
      window.removeEventListener("keydown", fecharEsc);
    };
  }, [fechar]);

 
  const handleCriarProjeto = async () => {
    if (!nomeNovoProjeto.trim()) return;

    try {
      const response = await api.post('/projetos', {
        nome: nomeNovoProjeto.trim(),
        texto: nomeNovoProjeto.trim()
      });

      const novoProj = response.data;
      const novoId = novoProj.id || novoProj._id || novoProj.novoId;

      setProjetos((prev) => [...prev, novoProj]);
      setProjetoId(novoId || "");
      setNomeNovoProjeto("");
      setExibirFormNovoProjeto(false);
    } catch (error) {
      console.error("Erro ao cadastrar projeto:", error);
      alert("Erro ao cadastrar projeto.");
    }
  };

  const enviar = (e) => {
    e.preventDefault();

    salvar({
      ...tarefaInicial,
      texto,
      prioridade,
      projeto_id: projetoId
    });
  };

  if (!aberto) return null;

  return (
    <div className={styles.overlay} onClick={fechar}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <h2>
          {tarefaInicial?.id ? "Editar tarefa" : "Nova tarefa"}
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

          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.85rem', color: '#a0a0a0' }}>Projeto</span>
              <button
                type="button"
                onClick={() => setExibirFormNovoProjeto(!exibirFormNovoProjeto)}
                style={{
                  width: '28px',
                  height: '28px',
                  borderRadius: '50%',
                  border: 'none',
                  backgroundColor: '#61dafb',
                  color: '#12121a',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  cursor: 'pointer'
                }}
                title="Cadastrar projeto"
              >
                +
              </button>
            </div>

            {exibirFormNovoProjeto && (
              <div style={{ display: 'flex', gap: '6px' }}>
                <input
                  type="text"
                  placeholder="Nome do projeto"
                  value={nomeNovoProjeto}
                  onChange={(e) => setNomeNovoProjeto(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button
                  type="button"
                  onClick={handleCriarProjeto}
                  style={{
                    padding: '6px 12px',
                    backgroundColor: '#61dafb',
                    border: 'none',
                    borderRadius: '4px',
                    fontWeight: 'bold',
                    cursor: 'pointer'
                  }}
                >
                  Salvar
                </button>
              </div>
            )}

            {projetos.length === 0 ? (
              <select disabled style={{ opacity: 0.7 }}>
                <option value="">Não há projetos cadastrados.</option>
              </select>
            ) : (
              <select
                value={projetoId}
                onChange={(e) => setProjetoId(e.target.value)}
                required
              >
                <option value="" disabled>Selecione um projeto</option>
                {projetos.map((proj) => {
                  const idProj = proj.id || proj._id;
                  const nomeProj = proj.nome || proj.texto;
                  return (
                    <option key={idProj} value={idProj}>
                      {nomeProj}
                    </option>
                  );
                })}
              </select>
            )}
          </div>

          <div className={styles.botoes}>
            <button type="button" onClick={fechar}>
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