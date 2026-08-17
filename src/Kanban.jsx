import { useState, useEffect } from 'react'
import axios from 'axios'
import Header from './components/header'
import ListaTarefas from './components/ListaTarefas'
import stylesForm from './components/formulario.module.css'
import stylesKanban from './components/kanban.module.css'
import './App.css'

function Kanban() {
  const [tarefas, setTarefas] = useState(() => {
    const salvas = localStorage.getItem('kanban_tarefas')
    return salvas ? JSON.parse(salvas) : []
  })
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
    localStorage.setItem('kanban_tarefas', JSON.stringify(tarefas))
  }, [tarefas])

  
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

  const salvarTarefa = (novaTarefa) => {
    if (novaTarefa.id) {
      setTarefas(prev =>
        prev.map(t => (t.id === novaTarefa.id ? novaTarefa : t))
      )
    } else {
      setTarefas(prev => [
        ...prev,
        {
          ...novaTarefa,
          id: Date.now()
        }
      ])
    }

    setModalAberto(false)
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

  const moverTarefa = (id, direcao) => {
    const ordem = ['A fazer', 'Em andamento', 'Concluído']
    setTarefas(prev => prev.map(t => {
      if (t.id === id) {
        const indexAtual = ordem.indexOf(t.status)
        const novoIndex = direcao === 'direita' ? indexAtual + 1 : indexAtual - 1
        if (novoIndex >= 0 && novoIndex < ordem.length) {
          return { ...t, status: ordem[novoIndex] }
        }
      }
      return t
    }))
  }

  
  const excluirTarefa = (id) => {
    const confirmar = window.confirm('Tem certeza que deseja excluir esta tarefa?')
    if (!confirmar) return
    setTarefas(prev => prev.filter(t => t.id !== id))
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
            <h2>Nova tarefa</h2>
            <form onSubmit={handleSubmitModal}>
              <input
                type="text"
                placeholder="Digite a tarefa"
                value={tarefaAtual.texto}
                onChange={(e) => setTarefaAtual({ ...tarefaAtual, texto: e.target.value })}
                autoFocus
              />

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
