import { useState, useEffect } from 'react'
// ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
// Removida a importação do axios direto (usado anteriormente para a API externa do ViaCEP),
// mantendo apenas o serviço centralizado 'api'
import api from './api'
// ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
import { useAuth } from './components/contexts/authcontexts'
import Header from './components/header'
import ListaTarefas from './components/ListaTarefas'
import stylesForm from './components/formulario.module.css'
import stylesKanban from './components/kanban.module.css'
import './App.css'

const mapStatusParaColuna = (status) => {
  if (status === 'Em andamento') return 'andamento'
  if (status === 'Concluído') return 'concluido'
  return 'afazer'
}

const mapColunaParaStatus = (coluna) => {
  if (coluna === 'andamento') return 'Em andamento'
  if (coluna === 'concluido') return 'Concluído'
  return 'A fazer'
}

function Kanban() {
  const [tarefas, setTarefas] = useState([])

  // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
  // Novos estados para gerenciamento dos projetos e do modal de criação de projetos
  const [projetos, setProjetos] = useState([])
  const [modalProjetoAberto, setModalProjetoAberto] = useState(false)
  const [nomeNovoProjeto, setNomeNovoProjeto] = useState('')
  // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====

  const [modalAberto, setModalAberto] = useState(false)

  const { token } = useAuth()

  // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
  // Substituição dos campos 'cep' e 'cidade' por 'projetoId' na estrutura da tarefa atual
  const [tarefaAtual, setTarefaAtual] = useState({
    id: null,
    texto: '',
    prioridade: 'media',
    projetoId: '',
    status: 'A fazer'
  })
  // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====

  useEffect(() => {
    // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
    // Busca simultânea de tarefas e projetos do usuário na API
    const carregarDados = async () => {
      try {
        const [responseTarefas, responseProjetos] = await Promise.all([
          api.get('/tarefas'),
          api.get('/projetos')
        ])

        const listaProjetos = responseProjetos.data || []
        setProjetos(listaProjetos)

        const tarefasMapeadas = (responseTarefas.data || []).map(t => {
          const pId = t.projetoId || t.projeto_id
          const proj = listaProjetos.find(p => String(p.id) === String(pId))
          return {
            ...t,
            projetoId: pId || '',
            projetoNome: proj ? proj.nome : (t.projeto_nome || t.projetoNome || ''),
            status: mapColunaParaStatus(t.coluna)
          }
        })
        setTarefas(tarefasMapeadas)
      } catch (error) {
        console.error('Erro ao buscar dados da API:', error)
      }
    }

    carregarDados()
    // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
  }, [])

  useEffect(() => {
    if (!modalAberto && !modalProjetoAberto) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
        // Suporte ao fechamento de qualquer modal aberto ao pressionar a tecla Escape
        if (modalProjetoAberto) {
          setModalProjetoAberto(false)
        } else {
          setModalAberto(false)
        }
        // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalAberto, modalProjetoAberto])

  // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
  // Removida a função consultarCidade (ViaCEP)
  // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====

  const abrirNovaTarefa = (status) => {
    // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
    // Define o projetoId inicial com o primeiro projeto da lista, se existir
    setTarefaAtual({
      id: null,
      texto: '',
      prioridade: 'media',
      projetoId: projetos.length > 0 ? projetos[0].id : '',
      status
    })
    // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
    setModalAberto(true)
  }

  const editarTarefa = (tarefa) => {
    // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
    // Preserva o projetoId da tarefa existente ao abrir para edição
    const pId = tarefa.projetoId || tarefa.projeto_id || (projetos.length > 0 ? projetos[0].id : '')
    setTarefaAtual({
      ...tarefa,
      projetoId: pId
    })
    // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
    setModalAberto(true)
  }

  const salvarTarefa = async (novaTarefa) => {
    // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
    // Validação obrigatória da seleção de um projeto
    if (!novaTarefa.projetoId) {
      alert('Selecione ou cadastre um projeto antes de salvar a tarefa.')
      return
    }

    const payload = {
      texto: novaTarefa.texto,
      prioridade: novaTarefa.prioridade,
      projetoId: Number(novaTarefa.projetoId),
      coluna: mapStatusParaColuna(novaTarefa.status)
    }
    // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====

    try {
      if (novaTarefa.id) {
        const response = await api.put(`/tarefas/${novaTarefa.id}`, payload)
        // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
        const pId = response.data.projetoId || response.data.projeto_id || novaTarefa.projetoId
        const proj = projetos.find(p => String(p.id) === String(pId))
        const tarefaAtualizada = {
          ...response.data,
          projetoId: pId,
          projetoNome: proj ? proj.nome : '',
          status: mapColunaParaStatus(response.data.coluna)
        }
        // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
        setTarefas(prev =>
          prev.map(t => (t.id === novaTarefa.id ? tarefaAtualizada : t))
        )
      } else {
        const response = await api.post('/tarefas', payload)
        // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
        const pId = response.data.projetoId || response.data.projeto_id || novaTarefa.projetoId
        const proj = projetos.find(p => String(p.id) === String(pId))
        const novaTarefaMapeada = {
          ...response.data,
          projetoId: pId,
          projetoNome: proj ? proj.nome : '',
          status: mapColunaParaStatus(response.data.coluna)
        }
        // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
        setTarefas(prev => [...prev, novaTarefaMapeada])
      }

      setModalAberto(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      const mensagemErro = error.response?.data?.erro || 'Erro ao salvar a tarefa na API.'
      alert(mensagemErro)
    }
  }

  // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
  // Função para criar um novo projeto e vinculá-lo automaticamente à tarefa em criação
  const handleSalvarNovoProjeto = async (e) => {
    e.preventDefault()
    if (!nomeNovoProjeto.trim()) {
      alert('Por favor, informe o nome do projeto.')
      return
    }

    try {
      const response = await api.post('/projetos', { nome: nomeNovoProjeto.trim() })
      const novoProjeto = response.data

      setProjetos(prev => [...prev, novoProjeto])
      setTarefaAtual(prev => ({ ...prev, projetoId: novoProjeto.id }))
      setNomeNovoProjeto('')
      setModalProjetoAberto(false)
    } catch (error) {
      console.error('Erro ao cadastrar projeto:', error)
      const mensagemErro = error.response?.data?.erro || 'Erro ao criar projeto na API.'
      alert(mensagemErro)
    }
  }
  // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====

  const handleSubmitModal = (e) => {
    e.preventDefault()
    if (!tarefaAtual.texto.trim()) return
    salvarTarefa(tarefaAtual)
  }

  const moverTarefa = async (id, direcao) => {
    const ordem = ['A fazer', 'Em andamento', 'Concluído']
    const tarefaParaMover = tarefas.find(t => t.id === id)
    if (!tarefaParaMover) return

    const indexAtual = ordem.indexOf(tarefaParaMover.status)
    const novoIndex = direcao === 'direita' ? indexAtual + 1 : indexAtual - 1

    if (novoIndex >= 0 && novoIndex < ordem.length) {
      const novoStatus = ordem[novoIndex]
      const payload = {
        texto: tarefaParaMover.texto,
        prioridade: tarefaParaMover.prioridade,
        // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
        // Inclusão do projetoId no payload de movimentação de colunas
        projetoId: Number(tarefaParaMover.projetoId || tarefaParaMover.projeto_id),
        // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
        coluna: mapStatusParaColuna(novoStatus)
      }

      try {
        const response = await api.put(`/tarefas/${id}`, payload)
        // ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS =====
        const pId = response.data.projetoId || response.data.projeto_id || tarefaParaMover.projetoId
        const proj = projetos.find(p => String(p.id) === String(pId))
        const tarefaAtualizada = {
          ...response.data,
          projetoId: pId,
          projetoNome: proj ? proj.nome : tarefaParaMover.projetoNome,
          status: mapColunaParaStatus(response.data.coluna)
        }
        // ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS =====
        setTarefas(prev => prev.map(t => (t.id === id ? tarefaAtualizada : t)))
      } catch (error) {
        console.error('Erro ao mover tarefa:', error)
        const mensagemErro = error.response?.data?.erro || 'Erro ao mover tarefa.'
        alert(mensagemErro)
      }
    }
  }

  const excluirTarefa = async (id) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta tarefa?')
    if (!confirmar) return

    try {
      await api.delete(`/tarefas/${id}`)
      setTarefas(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
      alert('Erro ao excluir a tarefa na API.')
    }
  }

  const total = tarefas.length
  const pendentes = tarefas.filter(t => t.status !== 'Concluído').length
  const concluidos = tarefas.filter(t => t.status === 'Concluído').length

  const colunas = ['A fazer', 'Em andamento', 'Concluído']

  return (
    <div className="container">
      <Header total={total} pendentes={pendentes} concluidos={concluidos} />

      <main 
        className={stylesKanban.board} 
        style={{ marginLeft: token ? '250px' : '0px' }}
      >
        {colunas.map((colunaStatus) => (
          <ListaTarefas
            key={colunaStatus}
            statusColuna={colunaStatus}
            tarefas={tarefas.filter(t => t.status === colunaStatus)}
            onMover={moverTarefa}
            onExcluir={excluirTarefa}
            onNovaTarefa={abrirNovaTarefa}
            onEditar={editarTarefa}
          />
        ))}
      </main>

      {/* MODAL DE TAREFA */}
      {modalAberto && (
        <div className={stylesForm.overlay} onClick={() => setModalAberto(false)}>
          <div className={stylesForm.modal} onClick={(e) => e.stopPropagation()}>
            <h2>{tarefaAtual.id ? 'Editar tarefa' : 'Nova tarefa'}</h2>
            <form onSubmit={handleSubmitModal}>
              <input
                type="text"
                placeholder="Digite a tarefa"
                value={tarefaAtual.texto}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, texto: e.target.value })}
                autoFocus
                required
              />

              <select
                value={tarefaAtual.prioridade}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, prioridade: e.target.value })}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>

              {/* ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS ===== */}
              {/* Removidos os campos de CEP/Cidade. Exibição do select de projetos ou mensagem com botão quando não houver projetos */}
              {projetos.length > 0 ? (
                <select
                  value={tarefaAtual.projetoId}
                  onChange={(e) => setTarefaAtual({ ...tarefaAtual, projetoId: e.target.value })}
                  required
                >
                  <option value="" disabled>Selecione um projeto</option>
                  {projetos.map((p) => (
                    <option key={p.id} value={p.id}>
                      📁 {p.nome}
                    </option>
                  ))}
                </select>
              ) : (
                <div className={stylesForm.semProjetos}>
                  <p>Você ainda não possui projetos cadastrados.</p>
                  <button
                    type="button"
                    className={stylesForm.btnCadastrarProjeto}
                    onClick={() => setModalProjetoAberto(true)}
                  >
                    + Cadastrar Projeto
                  </button>
                </div>
              )}
              {/* ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS ===== */}

              <div className={stylesForm.botoes}>
                <button type="button" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button type="submit">Enviar</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ===== INÍCIO DA ALTERAÇÃO - SELECT DE PROJETOS ===== */}
      {/* Modal para cadastro individual de novos projetos */}
      {modalProjetoAberto && (
        <div className={stylesForm.overlay} onClick={() => setModalProjetoAberto(false)}>
          <div className={stylesForm.modal} onClick={(e) => e.stopPropagation()}>
            <h2>Novo Projeto</h2>
            <form onSubmit={handleSalvarNovoProjeto}>
              <input
                type="text"
                placeholder="Nome do projeto"
                value={nomeNovoProjeto}
                onChange={(e) => setNomeNovoProjeto(e.target.value)}
                autoFocus
                required
              />

              <div className={stylesForm.botoes}>
                <button type="button" onClick={() => setModalProjetoAberto(false)}>
                  Cancelar
                </button>
                <button type="submit">Salvar Projeto</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* ===== FIM DA ALTERAÇÃO - SELECT DE PROJETOS ===== */}
    </div>
  )
}

export default Kanban