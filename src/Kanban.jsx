import { useState, useEffect } from 'react'
import axios from 'axios'
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
  const [usuarios, setUsuarios] = useState([])
  const [modalAberto, setModalAberto] = useState(false)

  const { token, usuario: usuarioLogado } = useAuth()

  const [tarefaAtual, setTarefaAtual] = useState({
    id: null,
    texto: '',
    prioridade: 'media',
    usuarioId: '',
    cep: '',
    cidade: '',
    status: 'A fazer'
  })

  useEffect(() => {
    const carregarDados = async () => {
      try {
        const [resTarefas, resUsuarios] = await Promise.all([
          api.get('/tarefas'),
          api.get('/usuarios')
        ])

        const listaUsuarios = resUsuarios.data || []

        const tarefasMapeadas = resTarefas.data.map(t => {
          const uId = t.usuarioId || t.usuario_id
          const user = listaUsuarios.find(u => String(u.id) === String(uId))
          return {
            ...t,
            usuarioId: uId || '',
            usuarioNome: user ? user.nome : (t.usuario_nome || t.usuarioNome || ''),
            status: mapColunaParaStatus(t.coluna)
          }
        })
        
        setTarefas(tarefasMapeadas)
        setUsuarios(listaUsuarios)
      } catch (error) {
        console.error('Erro ao carregar dados da API:', error)
      }
    }

    carregarDados()
  }, [])

  useEffect(() => {
    if (!modalAberto) return

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        setModalAberto(false)
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [modalAberto])

  const consultarCidade = async (cepInput) => {
    const cepLimpo = cepInput.replace(/\D/g, '')
    if (cepLimpo.length !== 8) return ''

    try {
      const response = await axios.get(`https://viacep.com.br/ws/${cepLimpo}/json/`)
      if (response.data.erro) {
        alert('CEP não encontrado!')
        return ''
      }
      return `${response.data.localidade} - ${response.data.uf}`
    } catch (error) {
      console.error('Erro ao consultar CEP:', error)
      return ''
    }
  }

  const abrirNovaTarefa = (status) => {
    setTarefaAtual({
      id: null,
      texto: '',
      prioridade: 'media',
      usuarioId: usuarioLogado?.id || (usuarios[0]?.id || ''),
      cep: '',
      cidade: '',
      status
    })
    setModalAberto(true)
  }

  const editarTarefa = (tarefa) => {
    setTarefaAtual({
      ...tarefa,
      usuarioId: tarefa.usuarioId || tarefa.usuario_id || usuarioLogado?.id || ''
    })
    setModalAberto(true)
  }

  const salvarTarefa = async (novaTarefa) => {
    const payload = {
      texto: novaTarefa.texto,
      prioridade: novaTarefa.prioridade,
      cidade: novaTarefa.cidade,
      usuarioId: Number(novaTarefa.usuarioId),
      coluna: mapStatusParaColuna(novaTarefa.status)
    }

    try {
      if (novaTarefa.id) {
        const response = await api.put(`/tarefas/${novaTarefa.id}`, payload)
        const uId = response.data.usuarioId || response.data.usuario_id || novaTarefa.usuarioId
        const user = usuarios.find(u => String(u.id) === String(uId))

        const tarefaAtualizada = {
          ...response.data,
          usuarioId: uId,
          usuarioNome: user ? user.nome : '',
          status: mapColunaParaStatus(response.data.coluna)
        }

        setTarefas(prev =>
          prev.map(t => (t.id === novaTarefa.id ? tarefaAtualizada : t))
        )
      } else {
        const response = await api.post('/tarefas', payload)
        const uId = response.data.usuarioId || response.data.usuario_id || novaTarefa.usuarioId
        const user = usuarios.find(u => String(u.id) === String(uId))

        const novaTarefaMapeada = {
          ...response.data,
          usuarioId: uId,
          usuarioNome: user ? user.nome : '',
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

  const handleCepChange = async (e) => {
    const valor = e.target.value
    setTarefaAtual(prev => ({ ...prev, cep: valor, cidade: '' }))

    const cepLimpo = valor.replace(/\D/g, '')
    if (cepLimpo.length === 8) {
      const cidadeEncontrada = await consultarCidade(valor)
      setTarefaAtual(prev => ({ ...prev, cidade: cidadeEncontrada }))
    }
  }

  const handleSubmitModal = (e) => {
    e.preventDefault()
    if (!tarefaAtual.texto.trim()) {
      alert('Por favor, informe o texto da tarefa.')
      return
    }
    if (!tarefaAtual.usuarioId) {
      alert('Por favor, selecione um usuário responsável.')
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
        usuarioId: Number(tarefaParaMover.usuarioId || tarefaParaMover.usuario_id),
        coluna: mapStatusParaColuna(novoStatus)
      }

      try {
        const response = await api.put(`/tarefas/${id}`, payload)
        const uId = response.data.usuarioId || response.data.usuario_id || tarefaParaMover.usuarioId
        const user = usuarios.find(u => String(u.id) === String(uId))

        const tarefaAtualizada = {
          ...response.data,
          usuarioId: uId,
          usuarioNome: user ? user.nome : tarefaParaMover.usuarioNome,
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

              <select
                value={tarefaAtual.usuarioId}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, usuarioId: e.target.value })}
                required
              >
                <option value="">Selecione o Usuário Responsável</option>
                {usuarios.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nome} ({u.email})
                  </option>
                ))}
              </select>

              <input
                type="text"
                placeholder="CEP"
                value={tarefaAtual.cep}
                onChange={handleCepChange}
                maxLength={9}
              />
              
              {tarefaAtual.cidade && (
                <p className={stylesForm.cidade}>📍 {tarefaAtual.cidade}</p>
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
    </div>
  )
}

export default Kanban