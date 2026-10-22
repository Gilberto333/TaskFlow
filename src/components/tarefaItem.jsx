import styles from './tarefaItem.module.css'

function TarefaItem({ tarefa, onMover, onExcluir, onEditar }) {
  const { id, texto, prioridade, status, usuario_nome, projeto_nome, usuario, projeto } = tarefa

  {/* CORREÇÃO: Leitura resiliente do Responsável */}
  const nomeResponsavel = usuario_nome || 
    (typeof usuario === 'object' ? (usuario?.nome || usuario?.name || usuario?.email) : usuario) || 
    'Não atribuído'

  {/* CORREÇÃO: Leitura resiliente do Projeto */}
  const nomeProjeto = projeto_nome || 
    (typeof projeto === 'object' ? (projeto?.nome || projeto?.descricao || projeto?.texto) : projeto) || 
    'Sem projeto'

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

      {/* CORREÇÃO: Exibição estruturada do Responsável e do Projeto no card da tarefa */}
      <div className={styles.detalhesCard}>
        <div className={styles.infoItem}>
          <strong>Responsável:</strong> {nomeResponsavel}
        </div>
        <div className={styles.infoItem}>
          <strong>Projeto:</strong> {nomeProjeto}
        </div>
      </div>

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