import { useState, useEffect } from 'react'
import api from './api'
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
  const [projetos, setProjetos] = useState([])
  const [modalAberto, setModalAberto] = useState(false)
  const [modalProjetoAberto, setModalProjetoAberto] = useState(false)
  const [nomeNovoProjeto, setNomeNovoProjeto] = useState('')

  const { token } = useAuth()

  const [tarefaAtual, setTarefaAtual] = useState({
    id: null,
    texto: '',
    prioridade: 'media',
    projetoId: '',
    status: 'A fazer'
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resTarefas, resProjetos] = await Promise.all([
          api.get('/tarefas'),
          api.get('/projetos')
        ])

        const listaProjetos = resProjetos.data || []
        setProjetos(listaProjetos)

        const tarefasMapeadas = (resTarefas.data || []).map(t => {
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
        console.error('Erro ao carregar dados da API:', error)
      }
    }

    carregarDados()
  }, [])

  useEffect(() => {
    if (!modalAberto && !modalProjetoAberto) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        if (modalProjetoAberto) {
          setModalProjetoAberto(false)
        } else {
          setModalAberto(false)
        }
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalAberto, modalProjetoAberto])

  const abrirNovaTarefa = (status) => {
    setTarefaAtual({
      id: null,
      texto: '',
      prioridade: 'media',
      projetoId: projetos[0]?.id || '',
      status
    })
    setModalAberto(true)
  }

  const editarTarefa = (tarefa) => {
    setTarefaAtual({
      ...tarefa,
      projetoId: tarefa.projetoId || tarefa.projeto_id || (projetos[0]?.id || '')
    })
    setModalAberto(true)
  }

  const salvarTarefa = async (novaTarefa) => {
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

    try {
      if (novaTarefa.id) {
        const response = await api.put(`/tarefas/${novaTarefa.id}`, payload)
        const pId = response.data.projetoId || response.data.projeto_id || novaTarefa.projetoId
        const proj = projetos.find(p => String(p.id) === String(pId))

        const tarefaAtualizada = {
          ...response.data,
          projetoId: pId,
          projetoNome: proj ? proj.nome : '',
          status: mapColunaParaStatus(response.data.coluna)
        }

        setTarefas(prev =>
          prev.map(t => (t.id === novaTarefa.id ? tarefaAtualizada : t))
        )
      } else {
        const response = await api.post('/tarefas', payload)
        const pId = response.data.projetoId || response.data.projeto_id || novaTarefa.projetoId
        const proj = projetos.find(p => String(p.id) === String(pId))

        const novaTarefaMapeada = {
          ...response.data,
          projetoId: pId,
          projetoNome: proj ? proj.nome : '',
          status: mapColunaParaStatus(response.data.coluna)
        }

        setTarefas(prev => [...prev, novaTarefaMapeada])
      }

      setModalAberto(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      const mensagemErro = error.response?.data?.erro || 'Erro ao salvar a tarefa na API.'
      alert(mensagemErro)
    }
  }

  const handleSalvarNovoProjeto = async (e) => {
    e.preventDefault()
    if (!nomeNovoProjeto.trim()) {
      alert('Por favor, informe o nome do projeto.')
      return
    }

    try {
      const response = await api.post('/projetos', { nome: nomeNovoProjeto.trim() })
      const novoProjetoCriado = response.data

      setProjetos(prev => [...prev, novoProjetoCriado])
      setTarefaAtual(prev => ({ ...prev, projetoId: novoProjetoCriado.id }))
      setNomeNovoProjeto('')
      setModalProjetoAberto(false)
    } catch (error) {
      console.error('Erro ao cadastrar projeto:', error)
      const mensagemErro = error.response?.data?.erro || 'Erro ao criar projeto na API.'
      alert(mensagemErro)
    }
  }

  const handleSubmitModal = (e) => {
    e.preventDefault()
    if (!tarefaAtual.texto.trim()) {
      alert('Por favor, informe o texto da tarefa.')
      return
    }
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
        ...tarefaParaMover,
        projetoId: Number(tarefaParaMover.projetoId || tarefaParaMover.projeto_id),
        coluna: mapStatusParaColuna(novoStatus)
      }

      try {
        const response = await api.put(`/tarefas/${id}`, payload)
        const pId = response.data.projetoId || response.data.projeto_id || tarefaParaMover.projetoId
        const proj = projetos.find(p => String(p.id) === String(pId))

        const tarefaAtualizada = {
          ...response.data,
          projetoId: pId,
          projetoNome: proj ? proj.nome : tarefaParaMover.projetoNome,
          status: mapColunaParaStatus(response.data.coluna)
        }
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

              {/* SELECT OU ALERTA DE PROJETOS */}
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

              <div className={stylesForm.botoes}>
                <button type="button" onClick={() => setModalAberto(false)}>
                  Cancelar
                </button>
                <button type="submit">Salvar</button>
              </div>
            </form>
          </div>
        </div>
      )}

     
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
    </div>
  )
}

export default Kanban