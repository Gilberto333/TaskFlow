import { useState, useEffect } from 'react'
import axios from 'axios'
import api from './api'
import { useAuth } from './components/contexts/authcontexts'
import Header from './components/header'
import ListaTarefas from './components/ListaTarefas'
import stylesForm from './components/formulario.module.css'
import stylesKanban from './components/kanban.module.css'
import './App.css'

// Mapeamentos para compatibilidade com a API
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

  const { token } = useAuth()

  const [tarefaAtual, setTarefaAtual] = useState({
    id: null,
    texto: '',
    prioridade: 'media',
    cep: '',
    cidade: '',
    status: 'A fazer'
  })

  useEffect(() => {
    const buscarTarefas = async () => {
      try {
        const response = await api.get('/tarefas')
        // Mapeia a propriedade 'coluna' da API para 'status' do React
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
      cep: '',
      cidade: '',
      status
    })
    setModalAberto(true)
  }

  const editarTarefa = (tarefa) => {
    setTarefaAtual(tarefa)
    setModalAberto(true)
  }

  const salvarTarefa = async (novaTarefa) => {
    // Prepara o payload no formato exato que o backend espera
    const payload = {
      texto: novaTarefa.texto,
      prioridade: novaTarefa.prioridade,
      cidade: novaTarefa.cidade,
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
              />

              <select
                value={tarefaAtual.prioridade}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, prioridade: e.target.value })}
              >
                <option value="baixa">Baixa</option>
                <option value="media">Média</option>
                <option value="alta">Alta</option>
              </select>

              <input
                type="text"
                placeholder="CEP"
                value={tarefaAtual.cep}
                onChange={handleCepChange}
                maxLength={9}
              />
              {tarefaAtual.cidade && (
                <p className={stylesForm.cidade}>{tarefaAtual.cidade}</p>
              )}

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