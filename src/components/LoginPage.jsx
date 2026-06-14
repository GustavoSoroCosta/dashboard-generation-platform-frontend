import { useState } from "react";
import { login as apiLogin, register as apiRegister } from "../services/api.js";

const DEMO_EMAIL = "demo@dashboard.pt";
const DEMO_PASS = "demo123";

function LoginPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // 'login' | 'register'
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const isRegister = mode === "register";

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (isRegister) {
        await apiRegister({ email, password });
      }
      const user = await apiLogin({ username: email, password });
      onLogin(user);
    } catch (err) {
      setError(err.message || "Ocorreu um erro. Tenta novamente.");
      setLoading(false);
    }
  }

  function fillDemo() {
    setEmail(DEMO_EMAIL);
    setPassword(DEMO_PASS);
    setError("");
  }

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError("");
  }

  return (
    <div className="login-page">
      <div className="login-bg-orb login-bg-orb--1" />
      <div className="login-bg-orb login-bg-orb--2" />
      <div className="login-bg-orb login-bg-orb--3" />

      <div className="login-container">
        <div className="login-left">
          <div className="login-brand">
            <span className="login-brand-icon">◈</span>
            <span className="login-brand-name">Dashboard 2.0</span>
          </div>
          <h1 className="login-headline">
            Visualize dados<br />de forma dinâmica
          </h1>
          <p className="login-subtext">
            Plataforma de criação de dashboards com gráficos interativos, tabelas e KPIs configuráveis em tempo real.
          </p>
          <ul className="login-features">
            <li><span className="feature-dot" />Gráficos interativos com D3.js</li>
            <li><span className="feature-dot" />Temas Dark, Light e Daltónico</li>
            <li><span className="feature-dot" />KPI Cards e Tabelas dinâmicas</li>
            <li><span className="feature-dot" />Dados em tempo real via API</li>
            <li><span className="feature-dot" />Acessibilidade (WCAG)</li>
          </ul>
        </div>

        <div className="login-right">
          <div className="login-card">
            <h2 className="login-card-title">{isRegister ? "Criar conta" : "Entrar"}</h2>
            <p className="login-card-subtitle">
              {isRegister ? "Regista-te para começar a criar dashboards" : "Acede ao teu dashboard pessoal"}
            </p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="login-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="nome@exemplo.pt"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoComplete="username"
                  autoFocus
                />
              </div>

              <div className="login-field">
                <label htmlFor="login-pass">Palavra-passe</label>
                <input
                  id="login-pass"
                  type="password"
                  placeholder="Palavra-passe"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  autoComplete={isRegister ? "new-password" : "current-password"}
                />
              </div>

              {error && <p className="login-error" role="alert">{error}</p>}

              <button type="submit" className="login-btn" disabled={loading}>
                {loading
                  ? (isRegister ? "A criar conta..." : "A entrar...")
                  : (isRegister ? "Criar conta" : "Entrar")}
              </button>

              {!isRegister && (
                <button type="button" className="login-demo-btn" onClick={fillDemo}>
                  Preencher com credenciais demo
                </button>
              )}
            </form>

            <div className="login-hint">
              {!isRegister && (
                <>Demo: <code>demo@dashboard.pt</code> / <code>demo123</code><br /></>
              )}
              {isRegister ? "Já tens conta? " : "Não tens conta? "}
              <button type="button" className="login-switch" onClick={switchMode}>
                {isRegister ? "Entrar" : "Criar conta"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
