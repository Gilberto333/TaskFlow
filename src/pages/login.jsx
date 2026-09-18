import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/authcontexts"; 
import "./login.css";

function Login() {
  const [usuarioInput, setUsuarioInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  
  useEffect(() => {
    if (!localStorage.getItem("admin_usuario")) {
      localStorage.setItem("admin_usuario", "admin");
      localStorage.setItem("admin_senha", "1234");
    }
  }, []);

  const entrar = (e) => {
    e.preventDefault();

    const usuarioSalvo = localStorage.getItem("admin_usuario") || "admin";
    const senhaSalva = localStorage.getItem("admin_senha") || "1234";

    if (usuarioInput !== usuarioSalvo || senhaInput !== senhaSalva) {
      alert("Senha ou Usuário incorretos! Tente novamente");
      return; 
    }

    
    const dadosDoUsuario = { nome: usuarioInput };
    const tokenSimulado = "token-jwt-falsificado-123456";
    
    login(dadosDoUsuario, tokenSimulado);

   
    navigate("/Dashboard"); 
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
          value={usuarioInput}
          onChange={(e) => setUsuarioInput(e.target.value)}
        />
        <h5>Senha</h5>
        <input
          id="inputLoginSenha"
          type="password"
          placeholder="Senha"
          required
          value={senhaInput}
          onChange={(e) => setSenhaInput(e.target.value)}
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