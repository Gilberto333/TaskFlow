import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/authcontexts"; 
import api from "../services/api"; // 👈 Importe a sua instância do Axios (ajuste o caminho se necessário)
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
      // 1. Envia as credenciais reais para o Backend (o backend espera email e senha)
      const response = await api.post("/auth/login", {
        email: usuarioInput,
        senha: senhaInput
      });

      // 2. Extrai o token real e os dados do utilizador retornados pelo backend
      const { token, usuario } = response.data;

      // 3. Atualiza o contexto de autenticação com os dados válidos
      login(usuario, token);

      // 4. Redireciona para o Dashboard
      navigate("/Dashboard");

    } catch (error) {
      console.error("Erro no login:", error);
      // Exibe a mensagem de erro vinda do backend (ex: "Credenciais inválidas")
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