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
  const [usuarios, setUsuarios] = useState([])
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

  // 1. Buscar Tarefas
  useEffect(() => {
    const buscarTarefas = async () => {
      try {
        const response = await api.get('/tarefas')
        const tarefasMapeadas = (response.data || []).map(t => ({
          ...t,
          status: mapColunaParaStatus(t.coluna)
        }))
        setTarefas(tarefasMapeadas)
      } catch (error) {
        console.error('Erro ao buscar tarefas:', error)
      }
    }
    buscarTarefas()
  }, [])

  // 2. Buscar Usuários
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

  // 3. Buscar Projetos (Filtrando "Projetos para fazer logo" do backend)
  const buscarProjetos = async () => {
    try {
      const response = await api.get('/projetos')
      const lista = response.data || []
      const filtrados = lista.filter(p => {
        const nome = (p.nome || p.descricao || p.texto || '').trim().toLowerCase()
        return nome !== 'projetos para fazer logo'
      })
      setProjetos(filtrados)
    } catch (error) {
      console.error('Erro ao buscar projetos:', error)
    }
  }

  useEffect(() => {
    buscarProjetos()
  }, [])

  const abrirNovaTarefa = (status) => {
    setTarefaAtual({
      id: null,
      texto: '',
      usuario_id: usuarios.length > 0 ? String(usuarios[0].id || usuarios[0]._id || '') : '',
      prioridade: 'media',
      projeto_id: projetos.length > 0 ? String(projetos[0].id || projetos[0]._id || '') : '',
      status
    })
    setExibirFormNovoProjeto(false)
    setNomeNovoProjeto('')
    setModalAberto(true)
  }

  const editarTarefa = (tarefa) => {
    const projId = tarefa.projeto_id ?? tarefa.projetoId ?? (typeof tarefa.projeto === 'object' ? (tarefa.projeto?.id || tarefa.projeto?._id) : tarefa.projeto) ?? ''
    const usrId = tarefa.usuario_id ?? tarefa.usuarioId ?? (typeof tarefa.usuario === 'object' ? (tarefa.usuario?.id || tarefa.usuario?._id) : tarefa.usuario) ?? ''

    setTarefaAtual({
      ...tarefa,
      usuario_id: String(usrId),
      projeto_id: String(projId)
    })
    setExibirFormNovoProjeto(false)
    setNomeNovoProjeto('')
    setModalAberto(true)
  }

  const salvarTarefa = async (novaTarefa) => {
    const rawProjId = novaTarefa.projeto_id
    const parsedProjId = (!isNaN(Number(rawProjId)) && rawProjId !== '') ? Number(rawProjId) : rawProjId

    const rawUsrId = novaTarefa.usuario_id
    const parsedUsrId = (!isNaN(Number(rawUsrId)) && rawUsrId !== '') ? Number(rawUsrId) : rawUsrId

    // Envia todas as chaves e tipos para aceitar qualquer contrato da API
    const payload = {
      texto: novaTarefa.texto,
      descricao: novaTarefa.texto,
      usuario_id: parsedUsrId,
      usuarioId: parsedUsrId,
      usuario: parsedUsrId,
      prioridade: novaTarefa.prioridade,
      projeto_id: parsedProjId,
      projetoId: parsedProjId,
      projeto: parsedProjId,
      coluna: mapStatusParaColuna(novaTarefa.status)
    }

    try {
      if (novaTarefa.id) {
        const response = await api.put(`/tarefas/${novaTarefa.id}`, payload)
        const tarefaAtualizada = {
          ...response.data,
          status: mapColunaParaStatus(response.data.coluna)
        }
        setTarefas(prev => prev.map(t => (t.id === novaTarefa.id ? tarefaAtualizada : t)))
      } else {
        const response = await api.post('/tarefas', payload)
        const novaMapeada = {
          ...response.data,
          status: mapColunaParaStatus(response.data.coluna)
        }
        setTarefas(prev => [...prev, novaMapeada])
      }
      setModalAberto(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      alert(error.response?.data?.erro || 'Erro ao salvar a tarefa na API.')
    }
  }

  const handleCriarProjeto = async () => {
    if (!nomeNovoProjeto.trim()) return
    try {
      const response = await api.post('/projetos', {
        nome: nomeNovoProjeto.trim(),
        descricao: nomeNovoProjeto.trim(),
        texto: nomeNovoProjeto.trim()
      })
      const novoProj = response.data
      const novoId = String(novoProj.id || novoProj._id || '')

      setProjetos(prev => [...prev, novoProj])
      setTarefaAtual(prev => ({ ...prev, projeto_id: novoId }))
      setNomeNovoProjeto('')
      setExibirFormNovoProjeto(false)
    } catch (error) {
      console.error('Erro ao criar projeto:', error)
      alert('Erro ao criar projeto.')
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
      }
    }
  }

  const excluirTarefa = async (id) => {
    if (!window.confirm('Tem certeza que deseja excluir esta tarefa?')) return
    try {
      await api.delete(`/tarefas/${id}`)
      setTarefas(prev => prev.filter(t => t.id !== id))
    } catch (error) {
      console.error('Erro ao excluir tarefa:', error)
    }
  }

  // CRUZAMENTO DE DADOS: Associa o ID do projeto/usuário com os objetos da lista usando String()
  const tarefasProcessadas = tarefas.map(t => {
    let nomeUsr = t.usuario_nome || t.usuarioNome
    if (!nomeUsr && typeof t.usuario === 'object' && t.usuario) {
      nomeUsr = t.usuario.nome || t.usuario.name || t.usuario.email
    }
    if (!nomeUsr) {
      const idU = t.usuario_id ?? t.usuarioId ?? (typeof t.usuario !== 'object' ? t.usuario : null)
      if (idU !== null && idU !== undefined) {
        const u = usuarios.find(usr => String(usr.id || usr._id) === String(idU))
        if (u) nomeUsr = u.nome || u.name || u.email
      }
    }

    let nomeProj = t.projeto_nome || t.projetoNome
    if (!nomeProj && typeof t.projeto === 'object' && t.projeto) {
      nomeProj = t.projeto.nome || t.projeto.descricao || t.projeto.texto
    }
    if (!nomeProj) {
      const idP = t.projeto_id ?? t.projetoId ?? (typeof t.projeto !== 'object' ? t.projeto : null)
      if (idP !== null && idP !== undefined) {
        const p = projetos.find(proj => String(proj.id || proj._id) === String(idP))
        if (p) nomeProj = p.nome || p.descricao || p.texto
      }
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

      <main className={stylesKanban.board} style={{ marginLeft: token ? '250px' : '0px' }}>
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

              <select
                value={tarefaAtual.usuario_id}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, usuario_id: e.target.value })}
              >
                <option value="">Selecione um usuário</option>
                {usuarios.map((usr) => {
                  const idUsr = String(usr.id || usr._id)
                  return (
                    <option key={idUsr} value={idUsr}>
                      {usr.nome || usr.name || usr.email}
                    </option>
                  )
                })}
              </select>

              <select
                value={tarefaAtual.prioridade}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, prioridade: e.target.value })}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>

              <div className={stylesForm.secaoProjeto}>
                <div className={stylesForm.headerProjeto}>
                  <label>Projeto</label>
                  <button
                    type="button"
                    onClick={() => setExibirFormNovoProjeto(!exibirFormNovoProjeto)}
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
                    />
                    <button type="button" onClick={handleCriarProjeto}>
                      Salvar
                    </button>
                  </div>
                )}

                {projetos.length === 0 ? (
                  <select disabled>
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
                      const idProj = String(proj.id || proj._id)
                      return (
                        <option key={idProj} value={idProj}>
                          {proj.nome || proj.descricao || proj.texto}
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