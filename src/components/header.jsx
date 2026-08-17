import styles from './header.module.css'

function Header({ total = 0, pendentes = 0, concluidos = 0 }) {
  return (
    <header className={styles.header}>
      <div className={styles.cabecalho}>
        <h1>Kanban</h1>
        <p>Gerenciador de tarefas</p>
      </div>
      <div className={styles.contador}>
        <h4>{total} total</h4>
        <h4>{pendentes} pendentes</h4>
        <h4>{concluidos} concluídos</h4>
      </div>
    </header>
  )
}

export default Header;