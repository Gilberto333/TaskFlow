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
  const [modalAberto, setModalAberto] = useState(false)

  // Lista de usuários para o Select e resolução no card
  const [usuarios, setUsuarios] = useState([])

  // Gerenciamento de projetos
  const [projetos, setProjetos] = useState([])
  const [exibirFormNovoProjeto, setExibirFormNovoProjeto] = useState(false)
  const [nomeNovoProjeto, setNomeNovoProjeto] = useState('')

  const { token } = useAuth()

  const [tarefaAtual, setTarefaAtual] = useState({
    id: null,
    texto: '',
    usuario_id: '',
    prioridade: 'media',
    projeto_id: '',
    status: 'A fazer'
  })

  // Buscar tarefas da API
  useEffect(() => {
    const buscarTarefas = async () => {
      try {
        const response = await api.get('/tarefas')
        const tarefasMapeadas = response.data.map(t => ({
          ...t,
          status: mapColunaParaStatus(t.coluna)
        }))
        setTarefas(tarefasMapeadas)
      } catch (error) {
        console.error('Erro ao buscar tarefas da API:', error)
      }
    }

    buscarTarefas()
  }, [])

  // Buscar usuários para o Select
  useEffect(() => {
    const buscarUsuarios = async () => {
      try {
        const response = await api.get('/usuarios')
        setUsuarios(response.data || [])
      } catch (error) {
        console.error('Erro ao buscar usuários:', error)
      }
    }

    buscarUsuarios()
  }, [])

  // Buscar projetos para o Select
  const buscarProjetos = async () => {
    try {
      const response = await api.get('/projetos')
      setProjetos(response.data || [])
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
    }
  }

  useEffect(() => {
    buscarProjetos()
  }, [])

  useEffect(() => {
    if (!modalAberto) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalAberto(false)
        setExibirFormNovoProjeto(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalAberto])

  const abrirNovaTarefa = (status) => {
    setTarefaAtual({
      id: null,
      texto: '',
      usuario_id: usuarios.length > 0 ? (usuarios[0].id || usuarios[0]._id || '') : '',
      prioridade: 'media',
      projeto_id: projetos.length > 0 ? (projetos[0].id || projetos[0]._id || '') : '',
      status
    })
    setExibirFormNovoProjeto(false)
    setNomeNovoProjeto('')
    setModalAberto(true)
  }

  const editarTarefa = (tarefa) => {
    setTarefaAtual({
      ...tarefa,
      usuario_id: tarefa.usuario_id || tarefa.usuarioId || (tarefa.usuario?.id) || '',
      projeto_id: tarefa.projeto_id || tarefa.projetoId || (tarefa.projeto?.id) || ''
    })
    setExibirFormNovoProjeto(false)
    setNomeNovoProjeto('')
    setModalAberto(true)
  }

  const salvarTarefa = async (novaTarefa) => {
    const payload = {
      texto: novaTarefa.texto,
      descricao: novaTarefa.texto,
      usuario_id: novaTarefa.usuario_id,
      usuario: novaTarefa.usuario_id,
      prioridade: novaTarefa.prioridade,
      projeto_id: novaTarefa.projeto_id,
      coluna: mapStatusParaColuna(novaTarefa.status)
    }

    try {
      if (novaTarefa.id) {
        const response = await api.put(`/tarefas/${novaTarefa.id}`, payload)
        const tarefaAtualizada = {
          ...response.data,
          status: mapColunaParaStatus(response.data.coluna)
        }
        setTarefas(prev =>
          prev.map(t => (t.id === novaTarefa.id ? tarefaAtualizada : t))
        )
      } else {
        const response = await api.post('/tarefas', payload)
        const novaTarefaMapeada = {
          ...response.data,
          status: mapColunaParaStatus(response.data.coluna)
        }
        setTarefas(prev => [...prev, novaTarefaMapeada])
      }

      setModalAberto(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      const mensagemErro = error.response?.data?.erro || error.response?.data?.mensagem || 'Erro ao salvar a tarefa na API.'
      alert(mensagemErro)
    }
  }

  const handleCriarProjeto = async (e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    if (!nomeNovoProjeto.trim()) {
      alert('Por favor, informe o nome do projeto.')
      return
    }

    try {
      const response = await api.post('/projetos', {
        nome: nomeNovoProjeto.trim(),
        descricao: nomeNovoProjeto.trim(),
        texto: nomeNovoProjeto.trim()
      })

      const novoProjeto = response.data
      const novoId = novoProjeto.id || novoProjeto._id || novoProjeto.novoId

      setProjetos(prev => [...prev, novoProjeto])

      setTarefaAtual(prev => ({
        ...prev,
        projeto_id: novoId || prev.projeto_id
      }))

      setNomeNovoProjeto('')
      setExibirFormNovoProjeto(false)
    } catch (error) {
      console.error('Erro ao cadastrar projeto:', error)
      const mensagemErro = error.response?.data?.erro || error.response?.data?.mensagem || 'Erro ao cadastrar projeto.'
      alert(mensagemErro)
    }
  }

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
        ...tarefaParaMover,
        coluna: mapStatusParaColuna(novoStatus)
      }

      try {
        const response = await api.put(`/tarefas/${id}`, payload)
        const tarefaAtualizada = {
          ...response.data,
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

  // CORREÇÃO: Enriquecimento das tarefas com nome do responsável e do projeto para exibição nos cards
  const tarefasProcessadas = tarefas.map(t => {
    let nomeUsr = t.usuario_nome || t.usuarioNome
    if (!nomeUsr && typeof t.usuario === 'object' && t.usuario) {
      nomeUsr = t.usuario.nome || t.usuario.name || t.usuario.email
    }
    if (!nomeUsr) {
      const idU = t.usuario_id || t.usuarioId || (typeof t.usuario !== 'object' ? t.usuario : null)
      const u = usuarios.find(usr => String(usr.id || usr._id) === String(idU))
      if (u) nomeUsr = u.nome || u.name || u.email
    }

    let nomeProj = t.projeto_nome || t.projetoNome
    if (!nomeProj && typeof t.projeto === 'object' && t.projeto) {
      nomeProj = t.projeto.nome || t.projeto.descricao || t.projeto.texto
    }
    if (!nomeProj) {
      const idP = t.projeto_id || t.projetoId || (typeof t.projeto !== 'object' ? t.projeto : null)
      const p = projetos.find(proj => String(proj.id || proj._id) === String(idP))
      if (p) nomeProj = p.nome || p.descricao || p.texto
    }

    return {
      ...t,
      usuario_nome: nomeUsr,
      projeto_nome: nomeProj
    }
  })

  const total = tarefasProcessadas.length
  const pendentes = tarefasProcessadas.filter(t => t.status !== 'Concluído').length
  const concluidos = tarefasProcessadas.filter(t => t.status === 'Concluído').length

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
            tarefas={tarefasProcessadas.filter(t => t.status === colunaStatus)}
            onMover={moverTarefa}
            onExcluir={excluirTarefa}
            onNovaTarefa={abrirNovaTarefa}
            onEditar={editarTarefa}
          />
        ))}
      </main>

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

              {/* Select de Usuários */}
              <select
                value={tarefaAtual.usuario_id}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, usuario_id: e.target.value })}
              >
                <option value="">Selecione um usuário</option>
                {usuarios.map((usr) => {
                  const idUsr = usr.id || usr._id
                  const nomeUsr = usr.nome || usr.name || usr.email
                  return (
                    <option key={idUsr} value={idUsr}>
                      {nomeUsr}
                    </option>
                  )
                })}
              </select>

              {/* Select de Prioridade */}
              <select
                value={tarefaAtual.prioridade}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, prioridade: e.target.value })}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>

              {/* Gerenciamento de Projetos com botão "+" */}
              <div className={stylesForm.secaoProjeto}>
                <div className={stylesForm.headerProjeto}>
                  <label className={stylesForm.labelProjeto}>Projeto</label>
                  <button
                    type="button"
                    className={stylesForm.btnAdicionarProjeto}
                    onClick={(e) => {
                      e.preventDefault()
                      e.stopPropagation()
                      setExibirFormNovoProjeto(!exibirFormNovoProjeto)
                    }}
                    title="Cadastrar novo projeto"
                  >
                    +
                  </button>
                </div>

                {exibirFormNovoProjeto && (
                  <div className={stylesForm.formCriarProjeto}>
                    <input
                      type="text"
                      placeholder="Nome do projeto"
                      value={nomeNovoProjeto}
                      onChange={(e) => setNomeNovoProjeto(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          e.stopPropagation()
                          handleCriarProjeto()
                        }
                      }}
                    />
                    <button type="button" onClick={handleCriarProjeto}>
                      Salvar
                    </button>
                  </div>
                )}

                {/* CORREÇÃO: Select de Projetos com placeholder limpo "Selecione um projeto" (Sem o texto "Projetos para fazer logo") */}
                {projetos.length === 0 ? (
                  <select disabled className={stylesForm.selectDisabled}>
                    <option value="">Não há projetos cadastrados.</option>
                  </select>
                ) : (
                  <select
                    value={tarefaAtual.projeto_id}
                    onChange={(e) => setTarefaAtual({ ...tarefaAtual, projeto_id: e.target.value })}
                    required
                  >
                    <option value="" disabled>Selecione um projeto</option>
                    {projetos.map((proj) => {
                      const idProj = proj.id || proj._id
                      const nomeProj = proj.nome || proj.descricao || proj.texto
                      return (
                        <option key={idProj} value={idProj}>
                          {nomeProj}
                        </option>
                      )
                    })}
                  </select>
                )}
              </div>

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
    </div>
  )
}

export default Kanban