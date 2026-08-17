import styles from './tarefaItem.module.css'

function TarefaItem({ tarefa, onMover, onExcluir, onEditar }) {
  const { id, texto, prioridade, status, cidade } = tarefa

  return (
    <div
      className={styles.card}
      onDoubleClick={() => onEditar(tarefa)}
    >
      <div className={styles.headerCard}>
        <span className={`${styles.badge} ${styles[prioridade]}`}>
          {prioridade.toUpperCase()}
        </span>

        {onExcluir && (
          <button
            className={styles.btnExcluir}
            onClick={() => onExcluir(id)}
            title="Excluir tarefa"
          >
            &times;
          </button>
        )}
      </div>

      <p className={styles.texto}>{texto}</p>

      {cidade && (
        <small className={styles.cidade}>
          📍 {cidade}
        </small>
      )}

      {onMover && (
        <div className={styles.acoes}>
          <button
            disabled={status === 'A fazer'}
            onClick={() => onMover(id, 'esquerda')}
          >
            &larr;
          </button>

          <button
            disabled={status === 'Concluído'}
            onClick={() => onMover(id, 'direita')}
          >
            &rarr;
          </button>
        </div>
      )}
    </div>
  )
}

export default TarefaItem