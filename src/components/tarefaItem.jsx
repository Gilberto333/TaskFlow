import styles from './tarefaItem.module.css'

function TarefaItem({ tarefa, onMover, onExcluir, onEditar }) {
  // ===== INÍCIO DA ALTERAÇÃO - SISTEMA DE PROJETOS =====
  // Substituído o campo 'cidade' por 'projetoNome' na desestruturação das propriedades da tarefa
  const { id, texto, prioridade, status, projetoNome } = tarefa
  // ===== FIM DA ALTERAÇÃO - SISTEMA DE PROJETOS =====

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

      {/* ===== INÍCIO DA ALTERAÇÃO - SISTEMA DE PROJETOS ===== */}
      {/* Exibição do nome do projeto vinculado no card de tarefa no lugar da antiga cidade */}
      {projetoNome && (
        <small className={styles.cidade}>
          📁 {projetoNome}
        </small>
      )}
      {/* ===== FIM DA ALTERAÇÃO - SISTEMA DE PROJETOS ===== */}

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