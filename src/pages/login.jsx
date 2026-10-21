import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../components/contexts/authcontexts"; 
import api from "../api"; 
import "./login.css";

function Login() {
  const [modoCadastro, setModoCadastro] = useState(false);
  const [nomeInput, setNomeInput] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [senhaInput, setSenhaInput] = useState("");
  
  const navigate = useNavigate();
  const { login } = useAuth(); 

  const executarLogin = async (email, senha) => {
    const response = await api.post("/auth/login", { email, senha });
    const { token, usuario } = response.data;
    login(usuario, token);
    navigate("/Dashboard");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      if (modoCadastro) {
        if (!nomeInput || !emailInput || !senhaInput) {
          alert("Por favor, preencha todos os campos.");
          return;
        }

        await api.post("/usuarios", {
          nome: nomeInput,
          email: emailInput,
          senha: senhaInput
        });

        alert("Usuário cadastrado com sucesso! Efetuando login...");
        
        await executarLogin(emailInput, senhaInput);
      } else {
        if (!emailInput || !senhaInput) {
          alert("Por favor, preencha o e-mail e a senha.");
          return;
        }
        await executarLogin(emailInput, senhaInput);
      }
    } catch (error) {
      console.error("Erro na operação:", error);
      const mensagemErro = error.response?.data?.erro || error.response?.data?.mensagem || "Erro ao processar requisição.";
      alert(mensagemErro);
    }
  };

  return (
    <section id="sectionLogin">
      <div id="cabecalhoLogin">
        <h3>{modoCadastro ? "Criar Conta" : "Login"}</h3>
      </div>
      <form onSubmit={handleSubmit} id="formularioLogin">
        {modoCadastro && (
          <>
            <h5>Nome</h5>
            <input
              type="text"
              placeholder="Digite seu nome"
              required
              value={nomeInput}
              onChange={(e) => setNomeInput(e.target.value)}
            />
          </>
        )}

        <h5>E-mail</h5>
        <input
          id="inputLoginUsuario"
          type="email"
          placeholder="seu@email.com"
          required
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
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
            {modoCadastro ? "Cadastrar e Entrar" : "Entrar"}
          </button>
        </div>

        <div style={{ marginTop: "15px", textAlign: "center" }}>
          <button
            type="button"
            style={{ background: "none", border: "none", color: "#007bff", cursor: "pointer", textDecoration: "underline" }}
            onClick={() => setModoCadastro(!modoCadastro)}
          >
            {modoCadastro ? "Já tem uma conta? Faça login" : "Não tem conta? Cadastre-se"}
          </button>
        </div>
      </form>
    </section>
  );
}

export default Login;