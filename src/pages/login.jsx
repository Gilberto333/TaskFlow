import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/authcontexts"; 
import api from "../api"; 
import "./login.css";

function Login() {
  const [usuarioInput, setUsuarioInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const entrar = async (e) => {
    e.preventDefault();

    if (!usuarioInput || !senhaInput) {
      alert("Por favor, preencha o e-mail e a palavra-passe.");
      return;
    }

    try {
     
      const response = await api.post("/auth/login", {
        email: usuarioInput,
        senha: senhaInput
      });

   
      const { token, usuario } = response.data;

      
      login(usuario, token);

    
      navigate("/Dashboard");

    } catch (error) {
      console.error("Erro no login:", error);
      
      const mensagemErro = error.response?.data?.erro || "Erro ao efetuar login. Verifique os seus dados.";
      alert(mensagemErro);
    }
  };

  return (
    <section id="sectionLogin">
      <div id="cabecalhoLogin">
        <h3>Login</h3>
      </div>
      <form onSubmit={entrar} id="formularioLogin">
        <h5>E-mail</h5>
        <input
          id="inputLoginUsuario"
          type="email"
          placeholder="user@use12gmail.com"
          required
          value={usuarioInput}
          onChange={(e) => setUsuarioInput(e.target.value)}
        />
        <h5>Palavra-passe</h5>
        <input
          id="inputLoginSenha"
          type="password"
          placeholder="Palavra-passe"
          required
          value={senhaInput}
          onChange={(e) => setSenhaInput(e.target.value)}
        />
        <div id="botaoFormularioLogin">
          <button id="botaoEntrar" type="submit">
            Entrar
          </button>
        </div>
      </form>
    </section>
  );
}

export default Login;