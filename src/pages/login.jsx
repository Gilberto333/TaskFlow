import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import "./login.css";
function Login() {
  const [usuario, setUsuario] = useState("");
  const [senha, setSenha] = useState("");

  localStorage.setItem("usuario", "admin");
  localStorage.setItem("senha", "1234");
  const navigate = useNavigate();
  const entrar = (e) => {
    e.preventDefault();
    if (
      localStorage.getItem("usuario") !== usuario ||
      localStorage.getItem("senha") !== senha
    ) {
      <Navigate to={<Login />} />;
      alert("Senha ou Usuário incorretos! Tente novamente");
    }
    if (
      localStorage.getItem("usuario") === usuario &&
      localStorage.getItem("senha") === senha
    ) {
      localStorage.setItem("usuarioLogado", "true")
    
      

      
     
    }
       return navigate("/Dashboard"); 
  };
  return (
    <section id="sectionLogin">
      <div id="cabecalhoLogin">
        <h3>Login</h3>
      </div>
      <div id="formularioLogin">
        <h5>Usuário</h5>
        <input
          id="inputLoginUsuario"
          placeholder="Usuário"
          required
          onChange={(e) => setUsuario(e.target.value)}
        />
        <h5>Senha</h5>
        <input
          id="inputLoginSenha"
          placeholder="Senha"
          required
          onChange={(e) => setSenha(e.target.value)}
        />
      </div>
      <div id="botaoFormularioLogin">
        <button id="botaoEntrar" onClick={entrar}>
          Entrar
        </button>
      </div>
    </section>
  );
}

export default Login;
