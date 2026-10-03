import { useState } from "react";
import { auth } from "../lib/supabase";

// Écran de connexion affiché quand aucune session active n'existe.
function LoginScreen({ onLogin }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPass, setShowPass] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) { setError("Veuillez remplir tous les champs."); return; }
    setLoading(true); setError("");
    const data = await auth.login(email, password);
    if (data.access_token) {
      auth.saveSession(data);
      onLogin(data);
    } else {
      // Distinguer "utilisateur inexistant" vs "mauvais mot de passe"
      const msg = data.error_description || data.msg || data.message || "";
      if (msg.toLowerCase().includes("invalid login") || msg.toLowerCase().includes("user not found") || msg.toLowerCase().includes("no user")) {
        setError("Aucun compte trouvé avec cet email. Vérifiez votre adresse ou contactez l'administrateur.");
      } else if (msg.toLowerCase().includes("invalid password") || msg.toLowerCase().includes("wrong password")) {
        setError("Mot de passe incorrect. Veuillez réessayer.");
      } else if (msg.toLowerCase().includes("email not confirmed")) {
        setError("Email non confirmé. Vérifiez votre boîte mail.");
      } else {
        setError("Identifiants incorrects. Vérifiez votre email et mot de passe.");
      }
    }
    setLoading(false);
  };

  return (
    <div style={{ height: "100vh", width: "100vw", overflow: "hidden", background: "linear-gradient(135deg,#0f2744 0%,#1a4a7a 50%,#0f2744 100%)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div style={{ width: "100%", maxWidth: 420 }}>
        {/* Logo / titre */}
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <div style={{ margin: "0 auto 16px", width: 90, height: 90, borderRadius: "50%", overflow: "hidden", boxShadow: "0 8px 24px rgba(0,0,0,0.3)", border: "3px solid rgba(255,255,255,0.2)" }}>
            <img src="data:image/jpeg;base64,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" alt="CGA-CDA" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.3, textAlign: "center" }}>Centre de Gestion Agréé<br/>Centrale Des Associés</h1>
          <p style={{ color: "#7eb3e8", fontSize: 13, margin: "6px 0 0", textAlign: "center" }}>Connectez-vous pour accéder à votre espace</p>
        </div>

        {/* Carte login */}
        <div style={{ background: "#fff", borderRadius: 20, padding: 32, boxShadow: "0 20px 60px rgba(0,0,0,0.3)" }}>
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6d8c", display: "block", marginBottom: 6 }}>Adresse email</label>
            <input
              type="email" value={email} onChange={e => setEmail(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              placeholder="votre@email.com"
              style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: "1.5px solid #87CEEB", fontSize: 14, color: "#1e3a57", outline: "none", boxSizing: "border-box", background: "#f8fbff" }}
            />
          </div>
          <div style={{ marginBottom: 24 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: "#4a6d8c", display: "block", marginBottom: 6 }}>Mot de passe</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)}
                onKeyDown={e => e.key === "Enter" && handleLogin()}
                placeholder="••••••••"
                style={{ width: "100%", padding: "11px 40px 11px 14px", borderRadius: 10, border: "1.5px solid #87CEEB", fontSize: 14, color: "#1e3a57", outline: "none", boxSizing: "border-box", background: "#f8fbff" }}
              />
              <button onClick={() => setShowPass(!showPass)}
                style={{ position: "absolute", right: 12, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", color: "#8da4c0", fontSize: 13 }}>
                {showPass ? "🙈" : "👁️"}
              </button>
            </div>
          </div>

          {error && (
            <div style={{ padding: "10px 14px", borderRadius: 9, background: "#fff0f0", border: "1px solid #fcc", color: "#c0392b", fontSize: 13, marginBottom: 16 }}>
              ⚠️ {error}
            </div>
          )}

          <button onClick={handleLogin} disabled={loading}
            style={{ width: "100%", padding: "13px", borderRadius: 11, background: loading ? "#93b8d8" : "linear-gradient(135deg,#2e7fcf,#1a5c9e)", color: "#fff", border: "none", fontSize: 15, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer", boxShadow: "0 4px 14px rgba(26,92,158,0.35)", transition: "all 0.2s" }}>
            {loading ? "Connexion en cours..." : "Se connecter →"}
          </button>

          <p style={{ textAlign: "center", fontSize: 12, color: "#8da4c0", marginTop: 20, marginBottom: 0 }}>
            Accès réservé aux membres du cabinet
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginScreen;
