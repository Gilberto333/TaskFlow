import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './components/header'
import ListaTarefas from './components/ListaTarefas'
import stylesForm from './components/formulario.module.css'
import stylesKanban from './components/kanban.module.css'
import './App.css'

function Kanban() {
  const [tarefas, setTarefas] = useState([])
  const URL_API = "https://6a85b5cf9c451dc67a640647.mockapi.io/taskFlow"
  const [modalAberto, setModalAberto] = useState(false)

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
        const response = await axios.get(URL_API)
        setTarefas(response.data)
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

  // Função para salvar a tarefa via API (POST para criar, PUT para atualizar)
  const salvarTarefa = async (novaTarefa) => {
    try {
      if (novaTarefa.id) {
        const response = await axios.put(`${URL_API}/${novaTarefa.id}`, novaTarefa)
        setTarefas(prev =>
          prev.map(t => (t.id === novaTarefa.id ? response.data : t))
        )
      } else {
        const response = await axios.post(URL_API, novaTarefa)
        setTarefas(prev => [...prev, response.data])
      }

      setModalAberto(false)
    } catch (error) {
      console.error('Erro ao salvar tarefa:', error)
      alert('Erro ao salvar a tarefa na API.')
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
      const tarefaAtualizada = { ...tarefaParaMover, status: novoStatus }

      try {
        await axios.put(`${URL_API}/${id}`, tarefaAtualizada)
        setTarefas(prev => prev.map(t => (t.id === id ? tarefaAtualizada : t)))
      } catch (error) {
        console.error('Erro ao mover tarefa:', error)
      }
    }
  }

  const excluirTarefa = async (id) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta tarefa?')
    if (!confirmar) return

    try {
      await axios.delete(`${URL_API}/${id}`)
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

      <main className={stylesKanban.board}>
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

              {/* Seletor de Prioridade adicionado */}
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