import { NavLink } from "react-router-dom";
import { useState } from "react";
import styles from "./SideBar.module.css";

function Sidebar() {
  const [aberto, setAberto] = useState(true);

  const linkClass = ({ isActive }) =>
    isActive ? `${styles.link} ${styles.ativo}` : styles.link;

  return (
    <>
      
      <button
        className={styles.botaoMenu}
        onClick={() => setAberto(!aberto)}
      >
        ☰
      </button>

      
      {aberto && (
        <aside className={styles.sidebar}>
          <div className={styles.logo}>
            <h1>Kanban</h1>
          </div>

          <nav className={styles.nav}>
            <div className={styles.menuLinks}>
              <NavLink to="/Dashboard" className={linkClass}>
                Dashboard
              </NavLink>

              <NavLink to="/Sobre" className={linkClass}>
                Sobre
              </NavLink>
            </div>

            <NavLink
              to="/"
              className={`${styles.link} ${styles.sair}`}
              onClick={() =>
                localStorage.removeItem("usuarioLogado")
              }
            >
              Sair
            </NavLink>
          </nav>
        </aside>
      )}
    </>
  );
}

export default Sidebar;