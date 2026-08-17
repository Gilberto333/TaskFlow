import TarefaItem from './tarefaItem'
import styles from './listaTarefas.module.css'

function ListaTarefas({
  statusColuna,
  tarefas,
  onMover,
  onExcluir,
  onNovaTarefa,
  onEditar
}) {
  return (
    <div className={styles.coluna}>
      <div className={styles.topo}>
        <h3 className={styles.titulo}>{statusColuna}</h3>

        <button
          className={styles.botaoAdicionar}
          onClick={() => onNovaTarefa(statusColuna)}
        >
          +
        </button>
      </div>

      <div className={styles.lista}>
        {tarefas.length === 0 ? (
          <p className={styles.vazio}>Nenhuma tarefa</p>
        ) : (
          tarefas.map((tarefa) => (
            <TarefaItem
              key={tarefa.id}
              tarefa={tarefa}
              onMover={onMover}
              onExcluir={onExcluir}
              onEditar={onEditar}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default ListaTarefas