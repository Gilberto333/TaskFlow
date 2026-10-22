import styles from './tarefaItem.module.css'

function TarefaItem({ tarefa, onMover, onExcluir, onEditar }) {
  // CORREÇÃO: Mantidos os acessos para o projeto vinculado e exibições
  const { id, texto, prioridade, status, projeto, projeto_nome, projetoNome } = tarefa

  const nomeProjetoExibicao = typeof projeto === 'object' ? projeto?.nome : (projeto || projeto_nome || projetoNome)

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

      {/* Exibição do Projeto vinculado à tarefa */}
      {nomeProjetoExibicao && (
        <small className={styles.cidade}>
          📁 {nomeProjetoExibicao}
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