import './sobre.css'
function Sobre() {
  return (
    <div className="sobre-container">
      <section className="sobre-content">
        <h1>Sobre o Aplicativo</h1>
        <p>
          Este aplicativo foi desenvolvido para oferecer uma experiência simples, 
          intuitiva e eficiente. Focado em alta performance e usabilidade, ele traz 
          uma interface moderna para facilitar a navegação e entregar os melhores resultados.
        </p>
        <p>
          Construído com tecnologias modernas, o objetivo principal é proporcionar 
          uma solução prática e rápida para o dia a dia dos usuários.
        </p>
      </section>

      <footer>
        <p>&copy; {new Date().getFullYear()} Gilberto Fernandes. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
}

export default Sobre;