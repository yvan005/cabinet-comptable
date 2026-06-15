import { useState, useEffect, useCallback } from "react";

// ── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://egnhdnuquirsngwokwmy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbmhkbnVxdWlyc25nd29rd215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjc2NjEsImV4cCI6MjA5NDk0MzY2MX0.bt-hct6Ke5g1GuxdMgkRl23-RUersCVD2_mkpuIX4i0";

const db = {
  async get(table, params = "") {
    if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Variables Supabase manquantes"); return []; }
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc${params}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
    if (!res.ok) return [];
    return res.json();
  },
  async post(table, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  async patch(table, id, body) {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(body)
    });
    return res.json();
  },
  async delete(table, id) {
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
  }
};

// ── AUTH ─────────────────────────────────────────────────────────────────────
const auth = {
  async login(email, password) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    return res.json();
  },
  async logout(token) {
    await fetch(`${SUPABASE_URL}/auth/v1/logout`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
    });
  },
  getSession() {
    try { return JSON.parse(localStorage.getItem("sb_session") || "null"); } catch { return null; }
  },
  saveSession(session) { localStorage.setItem("sb_session", JSON.stringify(session)); },
  clearSession() { localStorage.removeItem("sb_session"); }
};

// ── LOGIN SCREEN ──────────────────────────────────────────────────────────────
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
      setError(data.error_description || data.msg || "Email ou mot de passe incorrect.");
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

// ── ICONS ────────────────────────────────────────────────────────────────────
const Icon = ({ d, size = 18, stroke = "currentColor" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={stroke} strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
    <path d={d} />
  </svg>
);
const ic = {
  dashboard: "M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z M9 22V12h6v10",
  clients:   "M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8 M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75",
  calendar:  "M8 2v4 M16 2v4 M3 10h18 M21 8a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2h14a2 2 0 002-2V8z",
  message:   "M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z",
  devis:     "M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8",
  bell:      "M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9 M13.73 21a2 2 0 01-3.46 0",
  search:    "M21 21l-4.35-4.35 M17 11A6 6 0 105 11a6 6 0 0012 0z",
  plus:      "M12 5v14 M5 12h14",
  check:     "M20 6L9 17l-5-5",
  alert:     "M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z M12 9v4 M12 17h.01",
  trend:     "M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6",
  send:      "M22 2L11 13 M22 2l-7 20-4-9-9-4 20-7z",
  trash:     "M3 6h18 M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6 M10 11v6 M14 11v6 M9 6V4a1 1 0 011-1h4a1 1 0 011 1v2",
  close:     "M18 6L6 18 M6 6l12 12",
  folder:    "M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z",
  menu:      "M3 12h18 M3 6h18 M3 18h18",
  rapports:  "M18 20V10 M12 20V4 M6 20v-6",
  collab:    "M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2 M12 11a4 4 0 100-8 4 4 0 000 8 M16 3.13a4 4 0 010 7.75 M21 21v-2a4 4 0 00-3-3.87",
  docs:      "M13 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V9z M13 2v7h7",
  depenses:  "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M12 6v6l4 2 M8 13h8 M8 17h8",
  service:   "M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12",
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  abonnement: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M8 12h8 M12 8v8",
  download:  "M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4 M7 10l5 5 5-5 M12 15V3",
  search:    "M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z",
  calendar:  "M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z",
  edit:      "M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7 M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z",
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
};


// ── RESPONSIVE HOOK ──────────────────────────────────────────────────────────
const useIsMobile = () => {
  const getIsMobile = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth <= 768 ||
      /Android|iPhone|iPad|iPod|Mobile/i.test(navigator.userAgent);
  };
  const [isMobile, setIsMobile] = useState(getIsMobile);
  useEffect(() => {
    const handler = () => setIsMobile(getIsMobile());
    window.addEventListener("resize", handler);
    // Force re-check after mount (fixes mobile initial render)
    setTimeout(() => setIsMobile(getIsMobile()), 100);
    return () => window.removeEventListener("resize", handler);
  }, []);
  return isMobile;
};

// ── SPINNER ──────────────────────────────────────────────────────────────────
const Spinner = () => (
  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", padding: 40 }}>
    <div style={{ width: 32, height: 32, border: "3px solid #e2eaf4", borderTop: "3px solid #1a5c9e", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

// ── MODAL ────────────────────────────────────────────────────────────────────
const Modal = ({ title, onClose, children }) => (
  <div style={S.overlay}>
    <div style={S.modal}>
      <div style={S.modalHeader}>
        <span style={S.modalTitle}>{title}</span>
        <button onClick={onClose} style={S.iconBtn}><Icon d={ic.close} size={18} stroke="#4a6d8c" /></button>
      </div>
      {children}
    </div>
  </div>
);

// ── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const isMobile = useIsMobile();
  const [session, setSession] = useState(() => auth.getSession());
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [userPerms, setUserPerms] = useState(null);
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [clientFilter, setClientFilter] = useState("Tous");

  const [clients, setClients] = useState([]);
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddClient, setShowAddClient] = useState(false);


  const [devisLines, setDevisLines] = useState([{ nom: "", groupe: "", tarif: 0, unite: "forfait", qty: 1 }]);
  const [devisClient, setDevisClient] = useState("");
  const [devisDate, setDevisDate] = useState(new Date().toISOString().split("T")[0]);
  const [devisSaving, setDevisSaving] = useState(false);
  const [depenses, setDepenses] = useState([]);
  const [showAddDepense, setShowAddDepense] = useState(false);
  const [newDepense, setNewDepense] = useState({ libelle: "", montant: "", categorie: "Fournitures", date: new Date().toISOString().split("T")[0], note: "" });
  const [depensePeriode, setDepensePeriode] = useState("jour");
  const [services, setServices] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ nom: "", description: "", tarif: "", unite: "forfait", groupe: "Assistance Comptable", actif: true });
  const [showEditService, setShowEditService] = useState(false);
  const [editService, setEditService] = useState(null);
  const [showAddAbo, setShowAddAbo] = useState(false);
  const [viewAbo, setViewAbo] = useState(null);
  const [aboFilter, setAboFilter] = useState("Tous");
  const [newAbo, setNewAbo] = useState({ client: "", services: [], montant: "", frequence: "Mensuel", date_debut: new Date().toISOString().split("T")[0], statut: "Actif", note: "" });
  const [serviceSearch, setServiceSearch] = useState("");
  const [abonnements, setAbonnements] = useState([]);
  const [devisClientSearch, setDevisClientSearch] = useState("");
  const [devisServiceSearch, setDevisServiceSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(null);
  const [previewDevis, setPreviewDevis] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingDevisId, setEditingDevisId] = useState(null);

  const [newClient, setNewClient] = useState({ nom: "", forme_juridique: "", rccm: "", nif: "", numero_contribuable: "", numero_recepisse: "", date_creation: "", secteur: "", region: "", departement: "", arrondissement: "", adresse: "", telephone: "", email: "", site_web: "", dirigeant: "", tel_dirigeant: "", email_dirigeant: "", regime_fiscal: "", centre_impots: "", tva: "Assujetti 19,25%", date_cloture: "31/12", banque: "", patente: "", responsable: "", date_entree: new Date().toISOString().split("T")[0], type_mission: "", referentiel: "SYSCOHADA", statut: "Actif", honoraires: "", ca: "" });

  const [collaborateurs, setCollaborateurs] = useState([]);
  const [showAddCollab, setShowAddCollab] = useState(false);
  const [showEditCollab, setShowEditCollab] = useState(false);
  const [editCollab, setEditCollab] = useState(null);
  const [newCollab, setNewCollab] = useState({ nom: "", role: "", email: "", telephone: "", statut: "CDI", dossiers: 0, note: "" });
  const [collabSaving, setCollabSaving] = useState(false);
  const [showAccesCollab, setShowAccesCollab] = useState(false);
  const [showPermissions, setShowPermissions] = useState(false);
  const [permCollab, setPermCollab] = useState(null);
  const [permSaving, setPermSaving] = useState(false);
  const [accesCollab, setAccesCollab] = useState(null);
  const [accesEmail, setAccesEmail] = useState("");
  const [accesPassword, setAccesPassword] = useState("");
  const [accesShowPass, setAccesShowPass] = useState(false);
  const [acesSaving, setAcesSaving] = useState(false);
  const [accesMsg, setAccesMsg] = useState(null);

  const [documents, setDocuments] = useState([]);
  const [echeances, setEcheances] = useState([]);
  const [showAddEcheance, setShowAddEcheance] = useState(false);
  const [newEcheance, setNewEcheance] = useState({ client: "", type: "", description: "", date_echeance: "", statut: "À faire", priorite: "Normale" });
  const [echeanceMois, setEcheanceMois] = useState(new Date().getMonth());
  const [echeanceAnnee, setEcheanceAnnee] = useState(new Date().getFullYear());
  const [viewEcheance, setViewEcheance] = useState(null);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [docFilter, setDocFilter] = useState("Tous");
  const [newDocClient, setNewDocClient] = useState("");
  const [newDocType, setNewDocType] = useState("Autre");
  const [docUploading, setDocUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [c, d, dep, srv, abo, col, docs, ech] = await Promise.all([
      db.get("clients"), db.get("devis"), db.get("depenses"), db.get("services"), db.get("abonnements"), db.get("collaborateurs"), db.get("documents"), db.get("echeances"),
    ]);
    setClients(Array.isArray(c) ? c : []);
    setDevisList(Array.isArray(d) ? d : []);
    setDepenses(Array.isArray(dep) ? dep : []);
    setServices(Array.isArray(srv) ? srv : []);
    setAbonnements(Array.isArray(abo) ? abo : []);
    setCollaborateurs(Array.isArray(col) ? col : []);
    setDocuments(Array.isArray(docs) ? docs : []);
    setEcheances(Array.isArray(ech) ? ech : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  const savePermissions = async () => {
    if (!permCollab) return;
    setPermSaving(true);
    await db.patch("collaborateurs", permCollab.id, { permissions: permCollab.permissions });
    setPermSaving(false);
    setShowPermissions(false);
    setPermCollab(null);
    loadAll();
  };

  const createAcces = async () => {
    if (!accesEmail || !accesPassword) { setAccesMsg({ type: "error", text: "Email et mot de passe requis." }); return; }
    if (accesPassword.length < 6) { setAccesMsg({ type: "error", text: "Le mot de passe doit faire au moins 6 caractères." }); return; }
    setAcesSaving(true); setAccesMsg(null);
    try {
      const res = await fetch(`${SUPABASE_URL}/auth/v1/signup`, {
        method: "POST",
        headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
        body: JSON.stringify({ email: accesEmail, password: accesPassword })
      });
      const data = await res.json();
      if (data.id || data.user?.id) {
        setAccesMsg({ type: "success", text: `✅ Accès créé pour ${accesEmail}` });
        setTimeout(() => { setShowAccesCollab(false); setAccesEmail(""); setAccesPassword(""); setAccesMsg(null); }, 2000);
      } else {
        const msg = data.msg || data.error_description || data.message || "Erreur lors de la création.";
        setAccesMsg({ type: "error", text: msg });
      }
    } catch (err) {
      setAccesMsg({ type: "error", text: "Erreur réseau : " + err.message });
    } finally {
      setAcesSaving(false);
    }
  };
  useEffect(() => { if (clients.length > 0 && !devisClient) setDevisClient(clients[0]?.nom || ""); }, [clients]);

  const navigate = (p) => { setPage(p); setSidebarOpen(false); };

  // CLIENTS
  const addClient = async () => {
    if (!newClient.nom) return;
    await db.post("clients", newClient);
    setNewClient({ nom: "", forme_juridique: "", rccm: "", nif: "", numero_contribuable: "", numero_recepisse: "", date_creation: "", secteur: "", region: "", departement: "", arrondissement: "", adresse: "", telephone: "", email: "", site_web: "", dirigeant: "", tel_dirigeant: "", email_dirigeant: "", regime_fiscal: "", centre_impots: "", tva: "Assujetti 19,25%", date_cloture: "31/12", banque: "", patente: "", responsable: "", date_entree: new Date().toISOString().split("T")[0], type_mission: "", referentiel: "SYSCOHADA Révisé", statut: "Actif", honoraires: "", ca: "" });
    setShowAddClient(false); loadAll();
  };
  const deleteClient = async (id) => { await db.delete("clients", id); loadAll(); };
  const updateClient = async () => {
    if (!editClient?.nom) return;
    await db.patch("clients", editClient.id, editClient);
    setEditClient(null);
    loadAll();
  };

  // ÉCHÉANCES (désactivé)
  const [viewClient, setViewClient] = useState(null);
  const [editClient, setEditClient] = useState(null);
  const [clientTab, setClientTab] = useState(0);

  const addEcheance = async () => {
    if (!newEcheance.client || !newEcheance.type || !newEcheance.date_echeance) return;
    await db.post("echeances", newEcheance);
    setShowAddEcheance(false);
    setNewEcheance({ client: "", type: "", description: "", date_echeance: "", statut: "À faire", priorite: "Normale" });
    loadAll();
  };
  const toggleFait = async () => {};
  const deleteEch = async () => {};

  // MESSAGES

  // ABONNEMENTS
  const addAbonnement = async () => {
    if (!newAbo.client || !newAbo.services?.length || !newAbo.montant) return;
    const { services, ...rest } = newAbo;
    const freqDays = { "Mensuel": 30, "Trimestriel": 90, "Semestriel": 180, "Annuel": 365 };
    const echeance = new Date();
    echeance.setDate(echeance.getDate() + (freqDays[newAbo.frequence] || 30));
    const aboData = { ...rest, montant: parseFloat(newAbo.montant), service: services.join(", "), prochaine_echeance: echeance.toISOString().split("T")[0] };
    await db.post("abonnements", aboData);
    setNewAbo({ client: "", services: [], montant: "", frequence: "Mensuel", date_debut: new Date().toISOString().split("T")[0], statut: "Actif", note: "" });
    setShowAddAbo(false);
    loadAll();
  };
  const deleteAbo = async (id) => { await db.delete("abonnements", id); loadAll(); };
  const toggleAboStatut = async (a, statut) => { await db.patch("abonnements", a.id, { statut }); loadAll(); };
  const getMRR = () => abonnements.filter(a => a.statut === "Actif").reduce((s, a) => {
    if (a.frequence === "Mensuel") return s + (a.montant || 0);
    if (a.frequence === "Trimestriel") return s + (a.montant || 0) / 3;
    if (a.frequence === "Semestriel") return s + (a.montant || 0) / 6;
    if (a.frequence === "Annuel") return s + (a.montant || 0) / 12;
    return s;
  }, 0);
  const getNextEcheance = (a) => {
    if (a.prochaine_echeance) return new Date(a.prochaine_echeance);
    const start = new Date(a.date_debut || Date.now());
    const now = new Date();
    const next = new Date(start);
    while (next <= now) {
      if (a.frequence === "Mensuel") next.setMonth(next.getMonth() + 1);
      else if (a.frequence === "Trimestriel") next.setMonth(next.getMonth() + 3);
      else if (a.frequence === "Semestriel") next.setMonth(next.getMonth() + 6);
      else next.setFullYear(next.getFullYear() + 1);
    }
    return next;
  };
  // DEVIS ACTIONS
  const dupliquerDevis = (d) => {
    setDevisClient(d.client);
    const lignes = (d.lignes || []).map(l => ({ nom: l.service || l.mission || "", groupe: l.groupe || "", tarif: l.tarif || l.prix || 0, unite: l.unite || "forfait", qty: l.qty || 1 }));
    setDevisLines(lignes.length > 0 ? lignes : [{ nom: "", groupe: "", tarif: 0, unite: "forfait", qty: 1 }]);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const marquerPaye = async (id) => {
    try {
      await db.patch("devis", id, { statut: "Payé", date_paiement: new Date().toISOString().split("T")[0] });
    } catch(e) {
      // Fallback if date_paiement column doesn't exist
      await db.patch("devis", id, { statut: "Payé" });
    }
    loadAll();
  };
  const marquerAnnule = async (id) => { await db.patch("devis", id, { statut: "Annulé" }); loadAll(); };

  // SERVICES
  const addService = async () => {
    if (!newService.nom) return;
    await db.post("services", { nom: newService.nom, tarif: parseFloat(newService.tarif) || null, unite: newService.unite, groupe: newService.groupe, actif: true });
    setNewService({ nom: "", description: "", tarif: "", unite: "forfait", groupe: "Assistance Comptable", actif: true });
    setShowAddService(false); loadAll();
  };
  const toggleServiceActif = async (s) => { await db.patch("services", s.id, { actif: !s.actif }); loadAll(); };
  const updateService = async () => {
    if (!editService) return;
    if (editService.id) {
      await db.patch("services", editService.id, { nom: editService.nom, tarif: parseFloat(editService.tarif) || null, unite: editService.unite, groupe: editService.groupe });
    } else {
      await db.post("services", { nom: editService.nom, tarif: parseFloat(editService.tarif) || null, unite: editService.unite || 'forfait', groupe: editService.groupe, actif: true });
    }
    setShowEditService(false); setEditService(null); loadAll();
  };
  const deleteService = async (id) => { await db.delete("services", id); loadAll(); };

  // DEPENSES
  const addDepense = async () => {
    if (!newDepense.libelle || !newDepense.montant) return;
    await db.post("depenses", { ...newDepense, montant: parseFloat(newDepense.montant) });
    setNewDepense({ libelle: "", montant: "", categorie: "Fournitures", date: new Date().toISOString().split("T")[0], note: "" });
    setShowAddDepense(false); loadAll();
  };
  const deleteDepense = async (id) => { await db.delete("depenses", id); loadAll(); };

  const filterDepenses = (periode) => {
    const now = new Date();
    return depenses.filter(d => {
      const date = new Date(d.date);
      if (periode === "jour") return date.toDateString() === now.toDateString();
      if (periode === "semestre") {
        const semStart = now.getMonth() < 6 ? new Date(now.getFullYear(), 0, 1) : new Date(now.getFullYear(), 6, 1);
        return date >= semStart && date <= now;
      }
      if (periode === "annee") return date.getFullYear() === now.getFullYear();
      return true;
    });
  };

  // DEVIS
  const totalHT = devisLines.reduce((s, l) => s + (l.tarif || 0) * (l.qty || 1), 0);
  const totalTTC = totalHT * 1.1925;
  const updateDevis = async (id, statut) => {
    if (!devisClient) { alert("Veuillez sélectionner un client."); return; }
    setDevisSaving(true);
    try {
      await db.patch("devis", id, {
        client: devisClient,
        date: devisDate,
        lignes: devisLines.map(l => ({ service: l.nom, groupe: l.groupe, tarif: l.tarif || 0, qty: l.qty || 1 })),
        total_ht: totalHT,
        total_ttc: totalHT * 1.1925,
        statut
      });
      await loadAll();
      setEditingDevisId(null);
      setDevisLines([{ nom: "", groupe: "", tarif: 0, unite: "forfait", qty: 1 }]);
      setDevisClient(clients[0]?.nom || "");
      alert("Devis mis à jour avec succès !");
    } catch(e) { alert("Erreur : " + e.message); }
    setDevisSaving(false);
  };

  const saveDevis = async (statut) => {
    if (!devisClient) { alert("Veuillez sélectionner un client."); return; }
    if (devisLines.every(l => !l.nom)) { alert("Veuillez ajouter au moins un service."); return; }
    setDevisSaving(true);
    try {
      await db.post("devis", {
        client: devisClient,
        date: devisDate,
        lignes: devisLines.map(l => ({ service: l.nom, groupe: l.groupe, tarif: l.tarif || 0, qty: l.qty || 1 })),
        total_ht: totalHT,
        total_ttc: totalHT * 1.1925,
        statut
      });
      await loadAll();
      if (statut !== "Brouillon") {
        setDevisLines([{ nom: "", groupe: "", tarif: 0, unite: "forfait", qty: 1 }]);
        setDevisClient(clients[0]?.nom || "");
      }
      alert("Devis " + (statut === "Brouillon" ? "sauvegardé en brouillon" : "enregistré") + " avec succès !");
    } catch(e) {
      alert("Erreur : " + e.message);
    }
    setDevisSaving(false);
  };

  const addLine = () => setDevisLines(l => [...l, { nom: "", groupe: "", tarif: 0, unite: "forfait", qty: 1 }]);
  const removeLine = (i) => setDevisLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) => setDevisLines(l => l.map((ln, idx) => idx === i ? (field === 'full' ? { ...ln, nom: val.nom, groupe: val.groupe, tarif: val.tarif || 0, unite: val.unite } : { ...ln, [field]: val }) : ln));


  const filteredClients = clients.filter(c => {
    const matchF = clientFilter === "Tous" || c.statut === clientFilter;
    const matchS = c.nom?.toLowerCase().includes(searchQuery.toLowerCase()) || c.secteur?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchF && matchS;
  });

  const kpis = [
    { label: "Clients actifs", value: clients.filter(c => c.statut === "Actif").length, delta: `${clients.length} au total`, color: "#1a5c9e", icon: ic.clients },
    { label: "Devis", value: devisList.length, delta: `${devisList.filter(d => d.statut === "Envoyé").length} envoyés`, color: "#1a7a4a", icon: ic.devis },
  ];

  const navItems = [
    { id: "dashboard",    label: "Tableau de bord",  icon: ic.dashboard },
    { id: "clients",      label: "Clients",           icon: ic.clients },
    { id: "abonnements",  label: "Abonnements",       icon: ic.abonnement },
    { id: "devis",        label: "Devis",             icon: ic.devis },
    { id: "services",     label: "Services",          icon: ic.service },
    { id: "depenses",     label: "Dépenses",          icon: ic.depenses },
    { id: "rapports",     label: "Rapports",          icon: ic.rapports },
    { id: "collab",       label: "Collaborateurs",    icon: ic.collab },
    { id: "documents",    label: "Documents",         icon: ic.docs },
    { id: "echeances",    label: "Échéances",          icon: ic.calendar },
    { id: "settings",     label: "Paramètres",        icon: ic.settings },
  ];

  const pageTitle = { abonnements: "Abonnements", dashboard: "Tableau de bord", clients: "Clients", devis: "Devis", rapports: "Rapports", collab: "Collaborateurs", documents: "Documents", services: "Services", depenses: "Dépenses", settings: "Paramètres", echeances: "Échéances fiscales" }[page] || "";

  // Charger les permissions du collaborateur connecté
  const loadUserPerms = useCallback(async () => {
    if (!session) return;
    const email = session.user?.email;
    const col = collaborateurs.find(c => c.email === email);
    if (col) setUserPerms(col.permissions || {});
    else setUserPerms(null); // admin — pas de restriction
  }, [session, collaborateurs]);

  useEffect(() => { loadUserPerms(); }, [loadUserPerms]);

  const canDo = (module, action) => {
    if (!userPerms) return true; // admin — tout autorisé
    return userPerms[module]?.[action] !== false && (userPerms[module]?.[action] === true || userPerms[module]?.voir === true);
  };

  const canSee = (module) => {
    if (!userPerms) return true;
    return userPerms[module]?.voir === true;
  };

  if (!session) return <LoginScreen onLogin={(s) => setSession(s)} />;

  return (
    <div style={{ display: "flex", height: "100vh", width: "100vw", overflow: "hidden", background: "#f0f4fa", fontFamily: "'DM Sans','Segoe UI',sans-serif", position: "relative" }}>
      <style>{`
        * { box-sizing: border-box; margin: 0; padding: 0; }
        html, body, #root { height: 100%; width: 100%; overflow: hidden; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes slideIn { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        body { margin: 0; }
        input:focus, select:focus, textarea:focus { border-color: #87CEEB !important; box-shadow: 0 0 0 3px rgba(135,206,235,0.2); }

        /* Hover effects */
        button { transition: all 0.2s ease; }
        button:hover { box-shadow: 0 4px 14px rgba(0,30,80,0.15); transform: translateY(-1px); }
        button:active { transform: translateY(0px); box-shadow: 0 1px 4px rgba(0,30,80,0.1); }

        .card-hover { transition: all 0.2s ease; }
        .card-hover:hover { box-shadow: 0 8px 24px rgba(0,30,80,0.12) !important; transform: translateY(-2px); }

        .row-hover { transition: background 0.15s ease, box-shadow 0.15s ease; }
        .row-hover:hover { background: #f5f9ff !important; box-shadow: inset 3px 0 0 #1a5c9e; }

        .nav-hover { transition: all 0.2s ease; }
        .nav-hover:hover { box-shadow: 0 4px 12px rgba(0,0,0,0.25); transform: translateX(3px); }
      `}</style>

      {/* OVERLAY mobile */}
      {isMobile && sidebarOpen && (
        <div onClick={() => setSidebarOpen(false)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 99 }} />
      )}

      {/* SIDEBAR */}
      <aside style={{
        width: 230, background: "#0f2744", display: "flex", flexDirection: "column", flexShrink: 0, padding: "24px 0",
        ...(isMobile ? { position: "fixed", top: 0, left: 0, height: "100vh", zIndex: 100, transform: sidebarOpen ? "translateX(0)" : "translateX(-100%)", transition: "transform 0.25s ease" } : {})
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "0 20px 28px" }}>
          <div style={{ width: 42, height: 42, borderRadius: "50%", overflow: "hidden", flexShrink: 0, border: "2px solid rgba(255,255,255,0.15)" }}>
            <img src="data:image/jpeg;base64,/9j/4QBeRXhpZgAATU0AKgAAAAgABAEBAAMAAAABAGwAAIdpAAQAAAABAAAAPgESAAMAAAABAAEAAAEAAAMAAAABAGgAAAAAAAAAAZIIAAQAAAABAAAAAAAAAAAAAAAAAAD/4AAQSkZJRgABAQAAAQABAAD/4gHYSUNDX1BST0ZJTEUAAQEAAAHIAAAAAAQwAABtbnRyUkdCIFhZWiAH4AABAAEAAAAAAABhY3NwAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAQAA9tYAAQAAAADTLQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAlkZXNjAAAA8AAAACRyWFlaAAABFAAAABRnWFlaAAABKAAAABRiWFlaAAABPAAAABR3dHB0AAABUAAAABRyVFJDAAABZAAAAChnVFJDAAABZAAAAChiVFJDAAABZAAAAChjcHJ0AAABjAAAADxtbHVjAAAAAAAAAAEAAAAMZW5VUwAAAAgAAAAcAHMAUgBHAEJYWVogAAAAAAAAb6IAADj1AAADkFhZWiAAAAAAAABimQAAt4UAABjaWFlaIAAAAAAAACSgAAAPhAAAts9YWVogAAAAAAAA9tYAAQAAAADTLXBhcmEAAAAAAAQAAAACZmYAAPKnAAANWQAAE9AAAApbAAAAAAAAAABtbHVjAAAAAAAAAAEAAAAMZW5VUwAAACAAAAAcAEcAbwBvAGcAbABlACAASQBuAGMALgAgADIAMAAxADb/2wBDAAEBAQEBAQEBAQEBAQEBAQICAQEBAQMCAgICAwMEBAMDAwMEBAYFBAQFBAMDBQcFBQYGBgYGBAUHBwcGBwYGBgb/2wBDAQEBAQEBAQMCAgMGBAMEBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgYGBgb/wAARCABsAGgDASIAAhEBAxEB/8QAHwAAAAYCAwEAAAAAAAAAAAAAAAcICQoLAwYBAgUE/8QAPBAAAQMDAwMDAQUHAwIHAAAAAQIDBAUGBwAIERIhMQkTQSIKFBVRYRYjMkJxgZEYM1IksRonNENTgoP/xAAcAQACAwEBAQEAAAAAAAAAAAAEBwUGCAkDAAL/xAA/EQABAwIEBAQDAwgLAQAAAAABAgMRBAUABhIhBzFBURMiYXEIFDIVUoEXIzNCQ3KRoSQ0RFNigpKiwdHh8P/aAAwDAQACEQMRAD8AiD8jxz3/AC0Pnj5Pga6A8gDnvyPnXB4UhRST0gcLWg89I+f76canFIG437df4Yo4nUOo6xzGOy1obKgtaUFPHUFq4458c62K3LUuu7qgil2hb9WuGqLWEpiUmCt5Q5/5dIPSOOe50urZ76f2Stx1WoqJlIrtNtipyQaNApcIuVirg88pbbUnnp+SrwEgn41N52G+hnYmMqHRJuUaNHtilOpS4ux6I6BNfPSf/XS/4ieohXSk8cjTFbyjbsv25FxzFUfKU6hKEQFPOfuo5AHkFEwOuEpd+K9bdL67Zsp03z9a2QFrBIp2Z/vXIIJHMpRqPTbEJvEfpgZ/yZOgRZzMS13agOqFTIkRdTqD3CSopDDQKirhJ7cdhzpz3H32e3Ldz0KNXW7PzVXm5yuiXEiUuPTUHj59t8pWByB+WrCPGuB8S4jpsCmWLZFvUZNNH/Sz2Kc2qWk8ccl0jq54JHPPg6N/lJKCFpBJ4SerydVeo4w5PtCym12dK45LqVlRPr4adIB/zEYMpuFfFi9qD12zAWFHctUjaEAenirCioe6BivLT9nPyQiMv/yTzj7oSelxFSgE8/py7opMgfZ7cs2jQna8i0czW3IlL9uOxUKGzU2m1c+XURypYBHbsPJGrJcK6ewUo8/kdcOd09PJSVfI86E/LnQ1Dn9IstIpPXSFoMeh1mPeD7YM/IZmVhJXR5mrW3e6/AcTP+JPhJkdwFAx1GKifKvpo5+xu9VTTG4tzfhhIkwUNmLOQQRyj2lgKCuOexHPnSB7gt64LWqJp1zUirUKoJdKDTqxT1RXAoeSAoDqH6jVyvlHbXhHL8BcK/cb2pXnlOqcRUHKW2iU26ocFaXUgK6uCRz+uo/e/v0KLLve2K7X8Z0sXpS2mOv9k6gEGsRipaeVQJPHJKSeSlRPKUqA86sNFeOFmeFhtoqt1T+qFnUyo9B4ggifVIHriAqn+NvDN4vXBtF3t6R5lMp8OpSOqvBPlUEiTCVkntiuX+SPkeRrjkfmNLo3ZbFsibbKzVpDcKo1izabUnGZUt2GtqbT3geC1LbI5TwTwCQAdIVCh1BAI5LfWlPz0fn/AE/XUfmDLd1yvcPlqxMKiZG6VA8ik8iO/bDNynm7L+d7Qmttjvit/rRsUHqlYO4UOojHfQ0NDUN4YxZcdFr9oKWQQEtnqP5DjuT/AEHf+2nUvTc2EXNuiyBbFRqNuyKnSJNUaZta21MlIqbpJ5eUCPqaQOXCocj6NIY26YbqebslUKzICXWqb9Mu4qgoFzoiI5Uocf8AFfQW/wD7as7PSV2T23t+xPbl9VO2okS6LgprZt9l6Nw7S6f0EJbSCOUFQJJ/rq9WVVqyjYnsy1zYWpCginSeTjo3JjqlGxPfl1wk+IN5vmbsyNZItTpaqHwXKt1GymGOQCT990bJOxSd94woXZnsFxztctekTUUun1TJaaYlmbcSowCYqeD+7ig/7aeDwePOnA1NrBLhSCpIHtn/AL69TXk12pwqNRarV6lIbiU2l092RUJTy+lDTDaSpxZV8AJBPP6azlmDMN6zVdV1dc4XXVnr0HRKR0HQAfhh9ZSyfl7IWXG7bbWw1TtDYDnP6yieZUrmSZk4TzuU3P4d2p42quUMzXfAtW34YIhsKdQZU11JH7qO0T1OLJUOQkEgHn41EP3OfaMtxF+V2VTttVrUfENmxpDqYVxXJGTNqFRQCQFtoIIbPz9Wm8/VD3/XPva3DXTNXWTGw7YtVkwMWW57v/TLjtLLTk5XJ49xakAD5IOs+3vZFi2m4nj7qN8mUJmAdv1WUlNi0ChMe7dt1OhX1KhxXBz7B47ucdPTz38c9NOGnw7cFeA3DhvN3E0JXUupBS0oFQSVCUpSkfUqOcxvty3xULtmK7Xy5mloVQE7T1P/AFjWV+rP6if45+Pt7n8mKkSZvX+DRamgQ1HnwIvSEKSPPBPxpyvbF9os3G2JXKVRty9u0XMNpx5iE1Ks23DECsRWj2KvPQtQJBIPkA8d9ID/ANS3ok/tWaLF2kbnplpqWYzuSW80e194CQeZJpvTweOAvp6h4/trJnDYxii5sLy91+w7Lr24nAlMnKdvW1aux93umz2QoJLzsVI9x5tKlpBV08ccnntqz2fiT8FPG64osNRahSOuHS0soS3JV5UkLSVQqSI1ddseFVbc42ZkPpc1RuZJjbfcdfbE+Ta/utwrvAxlSsq4TumHcNBnpKKjDDgRNgSR5Yksk9SFjv5A5+NKLX0+3wUdifpB8k6raPTD3y3hsm3MWteDFcnyMTXtWIlNynbyVEQ5sZ9RQzOab8IcQVJJV+STqyFt+t065qTSLipUpuXSqvAakU2RHX1NusupCkKB/ofOsKfE78P904A58RR6i5QvgqYWeZHPSSNpT36jpi+ZbzAm/UfiHZxPMDDcW+T08cZ7nrXrdXptAplOyNOgLSqWYoDFTSng+zLRxwrn4Ue4PGq3T1BNjdz7Xr8rk9ijOx7aRWnGaxRlNlDlCl89kKPH+0r4B7dxq3FUOeFeCNMV+sXsRtnNmK7ly1Tbfiy58aliLkGnx4BWubAJSluQEJBJdZcKFFR8ICuew0PwzzsnMdOnK13XKXSBTuK3LTkwlOo/s1GAfu8xjP3FDJVXw6uTmdcvohSN6xhI8jzQ3W4lIPldQmVCAdZ2MYq7ORwDyOCOQefI0NGnmrFlXwtkq5cf1ZPumkTOmlySPpXCX9TagfBPYf20Neddarhbq9yldAS60opUCY3HbuI3Bw17LfLVfrU1W07gLLqQtB7pUAUn+B37HEiP0AdnLeWr7tipVWlrktXlXFy6pMQOgRLeppV1NhJ7lLr/ALafyIJ1YtUiJGgIYhRGxHYiMNtoZbTwgJSngAf41HQ+z5YVj2Ni64q89Ggv/s9QKNQ6NUW0D3kqDAemBX5BTjiT/bUkFrhC209PJWT30Dx4r1N5hpLIz+goGUIA7uLSFuqI+9J0+kYXXw60gvNlrs1vmX7lUOK1Eb+A2tTbCQe0JCvdRx9+tcu+3aVd1r12167TolXotfprsSrUuegqZkR3R0uIWAQSCkkedbHrqvskn/tpJNqUhYUkwRjSYAJg4bSHpU+n+z7bg2m4fiuNNhuM81a3BQr4UT1H+YjvqMbOxlafqd+u1cm13IbSKNtt2lUyv0618W0dBjwpNOt5UaO42jpP7orlymVnjylBHg6nGmZCdT0pmRj7iFFJS+k9h5I7/GoTe9Vq+PR69Ymbv8pFkzbt28biXakL2k0ck+w9UUNqnse7wUtuGRFaeCSeVJbPA1KXTMeaL02hNyqnXkJ+nxVrWEHqYUYG22B2GaSmfUWmwFHnAGJZ6NmW1luxhjdeB8Vqsw0lMJyjrsuIrlrgAEu9HV1dh355502nts9DvCu1DP2S8t4py5kCmY3ytS51PvPBT4YcoMiNKQtBa4KeUhKlhQA+UjWzxPX59MBzHLd9StwEONMNHEk2YaDLXVFOpSCplKfb6FKHfuVAcAnSOdn3rc5y3bXnm/JysH2RjTZFhu3qjUJGW7rfktzpxaSoRGGFFwMl510skp79iQBzxoKhprlWViE0sl0kBEbkqJATpjfnEY9Xi38upTn0AGZ7Rv8AyxEg3RYviYl3G56xJSpinqfYGT6tS6S/H+n22EKUWEfp0hw/41YYek/k2TlTYHtsuWY89Llt2CxAkS3lcqWqJ+55J/8Az1XZ5xypUs05lypleRCYTVsoX7LqkCGyOglUlwpZCk+eo8p7eTzqx19M7Fj2FtkO3GwJ8I06qwcfQ36jD6CCiRJT7qwR8HlZ11S+PUqpuCmWKa4wbkI589IbGv8AicKbIY1ZgqVMj81JjC8Oe3hXb9NedW6PAuCj1Sh1aK3NpdXgOxqjFd/hcZcSUrSf6gnXt6xvDltQ8+NcoPziIKT5k8vfpv0w13ENqaUFCQQZncEdiMVn/rvbSlYhyfXK1FhMRv2GuH7hNLKPqep0z97T3lfolvlHPjvxoakH/aKcHN3XaMi7VQoaId441qESQ+hsfeHqjS+iQwT8kJb5T/cDQ1tW7ZKq+LFqt9+ZJ1vMIDkdXGyW1H3OkHGMuGecrJwpeuuWLgyFpoqpxLOpUEMLCXW08uSQuB6DDg3opxmadgG/AhKVl7I6UL4+CiBHHfT0AeJlhr2yUgDhfSeByPz0yb6IdTYl4IyGypxv3XL8jywjr7+27To/C+Of4SUnv+mns2XwV9A8kduT50h+OQUji9dpHN0kfumNP4Rhq/DKWHOA1iLZ8oYQD7pASoH1C5Pvj7tfFUIkWfCkRJjSZEWQjpeaVzwoc/prMpQHdShx28q11W6hKFFSkJQCAog+OTpOpdckyIj13OH6dEbnbEDv1mNjmetq+YrnzVj26ck1bbxk+puzHl0+46k6i3agpQ96OpLboDUc9QIJ4TzwPPbTfO2L1B8s4Bp9w2Xd9NtzcVhC+VJeuvEmZEu1GmyHEDpQ4w88pS2VhPflB55Tx4J1ZK3xYNoZLteq2TfdAptz2vXYamKpSKpHDzDzSuDwpJ7eQD/UA6jabn/s4GLL2rcu5Ns2SnMSO1WaXKpbVep5qNNWSCelCQQWxye3B+NdIeCPxL8E77kdOVeIdAgIA0h5LYlxIHl1KSCoEbbgEHmYwtr9ly+M1xqqJwnrE/8A0+2GEFZz9I2TeAySv018hqu1x4dduUbOa0Wy/JLauyqapPBZBJJHI7DnyNFLuh9QDJ24y2aHiK0rbsvBm322Fl2k4RxRB+50hC21cJMxZAW+rwfq7cjkaca/8NzvVYuZVObvLDz9rOyel25nqo+l1KO/Ckxek89wnt1DzpyHbH9m4xnY9dptybnsnzcvSIk1p9FrW5ShTqZ9B6g2+eepaOQPHnjjTXtWZ/gO4JVP2zbnPmqweZtI1OlJG6QARCTMAEkRiMfYztfGktugpT1PLbrt7YZ/9Gv017o3f5ot3Ld80FyPt6xpcDVQq1XnRFJTcVWZUVMxmCRwpltQQSU8j6eNWANPhsU9iNFbQ2000lLcdptHCUISOEJA+OAONapj7HtlYqtWjWRj226NalqUOOGqXQqJFTHjso/RCR5J/wA63rkEdRUP0OufvxAcdL/x+z6brVDRToBSy3M6E9z6nrHti/2Gxs2OiDbe6jzOM3I/Mf51wogpPfsdYiU8JB7E8kA/OuOQOSePp+NIoOLcRKcT2mdjhi71x6AxWcL42P0pLU64o4Cjx2fiNBR/p9A0Na568VxOUrDWOHIx4EdF1Py0J+A3CZKCf8n/ABoa6x/C25b6fgtRfMrCSpTxAjp4q/8A3HI/4naO6XDjjcTRJkpDIWQY8/gt/wDEYRJ9nP3E0u46KzbMpxQdv6wYqky5k0dP32kj2XGUAnutSSVdI79KCeONP/bnc25Lsaq44xXg+0qdceX8w1Oe1bky4HeikUOmwQ2udU5wBC1oSHmkJbR3K3W+eBzquw9GDdpUMKZbpFENQWw/bF0MVi1IokJbLkclSJzTfV5Uphb3YAnjx31YE5qp975LGCt1e22ZQrpr+PKdUDEtOqzhEjXJQau0wZsZErpJZdSYUdxKuO5aKTwFHWNuLVAxer/bsxKgtVrOhRP0pqGEaQhcdFQkyY542ZwHrRlmpumTliHaJ9brQ+9S1DhcQpHfQpRQQOQTPWMe1b9s77bEuG2alWciY7zjalRriG74oU63k2/Ip0RST+/p77XUHOhZTyhwd0hXfnjWkRsjbm9zdx3YcEXXaGGsOWPd1RoMa9qlQk1mq1+qU95TMtxlsq9pmMh5CkDqBWog+ONbvbee9zOSLntW26BtluzHtLXWEu5AujMs+NFhwIAST0U9uK6tUxalpSkFfQAFdRHbjRW0KJm3aPXL/wAf0nDd0ZswZft9Vm4LYquN50Z6t0t+qSXJU+HJiyFoSWg6+sIWhXUE6UWlaQ4paGjVJA0bJgjrtOkkbQOomcaVVukiCcKnwLM3JxF3Zb2enseXG1SpTZtG/LG6oyqtHUOxkwzyGlgjv0njsdEZg/ezLynuiyLiOVbcCj4rVGebwnk9MtPRdFRpLhj3AykdXAEd8tBBH+4nqKeQk6Shjfb/AJps6FuFzDjHDcjE1byNakC18VY5cuh+VUIyJEkolVecFPltt5puQ67w2eR7Xzrfbi9PR/FOMLMubDd95Wr2XcE1iPcGP6LdeT5UyjKmEgVRoRVnoCJLDk1PSrkBa0q8pB1JqteT2al5LzyCt0JQ3AACF6dRJAUoCF6UqIJEayBsBjw1VeoQIAPvh0vK1+UbF+NL6yPXlP8A4FYtqTqxWPuaQp4xIbKnnvbHUOV+22vjuO/GkIWh/rwy3bkfLLOTbJwy1WI7M218QVCw2qghuG4QptFTmKJcDqmlNk+0oBJJ8gaMO4tpTGSbayMuuZKzLEnZdx7WaTXLSruSZFQoVOFWiKbcS3AUfaHtKePT28eNF3aGc9zeL7WZxVeW2a9chXlaECPTaLfdiVWIaBV0tn22ZEhS3A5HBSlPWAhXB5A7eIO00rTNMpNMW3HtQnXHL0CjBHcjcbYLW4lZkg7YxZFyLu8n3ltqxZQK5jzFWR8l2TelVvyU5SF1yl+5RfwpLSI6VFKkpX+JLUe/bW94gzZne083K27bh6NbFYqNftaXWsX5Hx1THItMqEKGplExiQ064otvtrkMn6eRwsc6KTINXz5ByHtTzbLwXIv+7Ldx7fEHI9o4yrDXTTZtVFGdYSXX1BLiCIKhyjnuNcxFbh8j33/qfuPGDNlrxFia4YOG8TN1lirVSpVOppjLfflutlKENlUOKOEq/h5OjqelpH7ShLiGUoU2rcQFBzWdMR5iJgb7afbASnFBWsqIHtjfBvUnO71WMFN0VlzD5YNvKyQ0/wBTachttKluUjkduPuZBJJ7ONKT55GnEg6kI61Hsn+Lnxplxn02pT+BIzgy3mBOfITwvIR05YlmivZCSpUn3zCUekoW+HGTzyPbUe504s/mB/He3IZbzFTG7SqlGs5qXd9HU/7oRUOEhbSCD9XU6QBx/wAhoO/2603B6mYs51uKPgxvKl9Fgb/UraOke2B37q3b6Z2prD4TLSStSlbQlIlRPoAJxFy+0fbgolL/AGvoNDrjhdtayYdFjRGJIUwqpVFaXHSODwFpY5Sr5Hzxoajjer3uUqOZMxv0b78p59dckVq8GY7w9tMuYSYzZAP8jSeCPIPHOhrRWa82V2QxSWSiVKaVlCFQT+kMqX/uUcZQ4T5doc5WqrzHdGSHLk+4+lJ5paMIbH+lAP44aise8q7j+7LfvW2JLkS4bdqLcikPNEA++OyUnnt0q56Tz8E6m9emNu+tHcYvBViZFUzdmF1SqsF2lLrC22aXcMgRlRPfQFgqZQ41IAQT2KwRqC2CgE9YHSRwD54PweP0PB/tpRm2fcheW3O+41fpj0h6gPSGxcFFakqS3KaQer3WQk/Q6CAQfzA1HZfr7RVW6osV1/qlTBCj+yc5eII/mBEjF24kZTvKrxTZiy8kfalCSA2SE+OwoeZgn1P0qMwenXFpbja2d57SrPhX9dVmGmM2ZW/2lpNqhyKYtWQYZpCkOqUr3WeluWFJ4A5J1xfFs7yXLxpzeMrot2n21Gi0wXHBuV9ySpa1Sauag4goUlfK+qkdHBH0oI8eWDNsXqYX1nC3awqgZBpVUuXIOExamPLiuyoNNQ7bqqG6kqK5V2wkqPVMkQUe6PA4JPSDqQDU6JvKmV/Frtg37jiq2FUaWiRf9VnhLshmUqUystU9xkcONpjtyEJKv/k0i895AzHke5CmqUgoWNTbqd0OI6FKpiR1B3GGfw14qWDidZ/GozoqEHS6wrZ5pafqC084+6obH0xl3K4+3R3DLx9UMY1KkR67ZYVMgVp6rpiwF1dVBq0Zr32VIU4419/l05ZT1c8J/TXzTcZZlyPZ2K7Vzam2cr09dUqi8tW1AC4EUuOpQ7TpCD1lbyIrrbjZQFJChIC+4TwfkXivdEKBaz1TFDvG6KXt6Zg0QVuthr8IyCwZXRUlL9pQebUJMXlKgf8Aa1iqNl771VAS6RcFoxocf3i5QZi4y0JU2mrqZShxEcKIUpygfPZLLgPzzRGm0pJGmOZ27kgkz/L2wy06TPcYw0W0d87EBDk66Md2zT6RWkuUazbapjspidR23QG2JEhxwCMpLSf42EhQVwFEgnWC6bL3SM12sVazZtNEypYEdpS61KrCXai3eSZNRXDWXVghURtxcUEABZ479udbjj2FvJkJpNx3szR3H4VoqjuWo/U22Pera3EB+WpxDfAjpT1dLfk9tE5beNPUTjUZ6dXbisj9tahYT71deTUGn4Llys0GCxFLKPZC0MqqCKi4rgj/AHAfnRCglbgVHm5Tj4KUdsG3Z1q7wIMPNMO8botuQ5dFiVaHiwKCVswK9IqFRENxaUBKi03DcpnVwef3KuO+ks2dG3hYO+54arF0WnXq1XKK2zixyzqBMagsz3avLkTA4tTTiA01SzT2kiQtAK0q6eSONKCqOON5Mun4IuO5a7bF1XbZ14V2TkiPRp4pcN2DJfZRFaYPtklUdoyFAn+Lgj+YaN3I1kZEtaystX7aF629bt91xv3aJUrneZZpsRTUoFgvOuDpCHGyUK7c/X278a/JbW+4lCR6Ab7npAEye3rgd9aKdpTrigG0gkkwBtz35R6kxgoLhsvebTL/AL1uaiXdjluEi2YkG3zVYSvdeUWYZekSOFBDfsuLnLHCfqBA+dMMerh6lk6z8S03GEm7I10u2LCDNZuGM6GG7luBQ6OWWAeSy3ypfPjqA0Y++r1hJlgYqvW1pVYaojsW7arGkXFT6gn3qxA93pjMUtCQCGSEJJWv6ulHHzqDduB3AXluCviVdNyreTBQpYolGL5KIrBP8ZHyo/P9dajyDlFrhrQIvF4SE3FxJ+XpyfO3sfzzn3TvKUnckdMZMzjmR7jzeFWC1E/YaFD5ypB8r5SRFO0eqTGlahsATgnriuOtXdcNYue4pzs6r1ue4/LkOK5KiT2Tz+QGhry9DVafc+cqFvP+dxZJJPUnD0pbfTUtOhtIACQAI2EAACB02Ax0HIPB57/POuQojghPX2/h6uOddtDXmtS1pKZgHtzHse/rggoWURInvHTBp4jzZkHCVwIuGwa4uJ1LKpVIqRK4jw6SClaR589v14OpP3p9evZcePhQ7cuCvN0ZMZI/ErQv6oKNLkEIUP3EkE+x+Y/UAHzqJdrkAKCwQCPaWeCOfCTq3WfOlZbbSq31baamiV9TTgkD1QeaFR1HXeMK/N3CSwZjugulK4ujuSYh9kwox0Wnk4meYVzG04tacH+r/tyypSKXKumXPsOXNb6lzWuKlTOnp5KxJZJ5SeOB9JPJGl/WruY2/wB40uJWaDmXH78CSohlU66Y8NxRHnlp5aVj+41TtWVmzKeM2IFQsi9a7QjIZLS4MeetUUJB5+lpRIB/ppYdmeoDuUS9T4kq5qRU2EHhaajQ0rKx0/zKCgdGscJuFebyl6lL9IVEeUBDiRPqpSTil1+feOvDtgprFUlwYRJ1qLjDkDfklDiSfxE4tkF5jxJ0dSMqY48j6he8Ijjnv/7utIvTdFt6sekmr3HmHHzEFMhLRMC5WJ7xJPA/dMKUrjkj41WZq305y/CHZfXaJeaZ5QTQllPPjx7vHzpMF27/APcjIXMpsa4qLSGpqeFv0mhJaeR355QoqPB7alqn4asnUbCnHLi8UpBJAaQDAEmD4mx7HELafiO4o5me8GittKlStgVvuwCdpIDJn2kTixgz36xO3TF0ac3aX3m9zESfeqs15NNprKgOQVuPFJKSeB2HkjUVTfp69F4ZLbqFuW1caricS4tMOz6Aj2KNGHUOFSnOf3/AHI45+oDUZa7cq5FyIZcm87xr9eUT3ZmVFfteR/ICAfj40XwHHjnUHb7rkzIq/DsNDFSn9u+Q4qe6U/Sg9QRMYsr3DvOvECDm25lymP8AZqcFpo+i1TrWk8iCBI2wZOUcsXzl6vvXLe1ecq7z8hSo7CXlhiPz/K22fH9dFr867aGqjW1lZcqlbtQsrWsyoncqI3BJ9DyHLDstdot1ioU0tC0lllAASlCYCQOYHuOeBoaGhofElj//2Q==" alt="CGA-CDA" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div>
            <div style={{ color: "#ffffff", fontWeight: 800, fontSize: 15 }}>CGA-CDA</div>
            <div style={{ color: "#ffffff", fontSize: 9, lineHeight: 1.3, opacity: 0.8 }}>Centrale des Associés -<br/>Conseils & Expertise<br/>Comptable et Fiscale</div>
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px", flex: 1 }}>
          {navItems.filter(item => canSee(item.id)).map(item => (
            <button key={item.id} onClick={() => navigate(item.id)} className="nav-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 9, background: page === item.id ? "linear-gradient(135deg,#2e7fcf,#1a5c9e)" : "none", border: "none", cursor: "pointer", color: page === item.id ? "#fff" : "#8da4c0", fontSize: 13, fontWeight: page === item.id ? 600 : 500, textAlign: "left", width: "100%" }}>
              <Icon d={item.icon} size={17} stroke={page === item.id ? "#fff" : "#8da4c0"} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && <span style={{ background: "#c0392b", color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ padding: "16px 20px 40px", borderTop: "1px solid #1a3558" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
            <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a5c9e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>
              {session?.user?.email?.[0]?.toUpperCase() || "U"}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#e2eaf4", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{session?.user?.email || "Utilisateur"}</div>
              <div style={{ fontSize: 10, color: "#6b8aaa" }}>Connecté</div>
            </div>
          </div>
          <button onClick={async () => { await auth.logout(session?.access_token); auth.clearSession(); setSession(null); }}
            style={{ width: "100%", display: "flex", alignItems: "center", gap: 8, padding: "8px 10px", borderRadius: 8, background: "rgba(192,57,43,0.12)", border: "1px solid rgba(192,57,43,0.25)", color: "#e87c6e", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4 M16 17l5-5-5-5 M21 12H9" />
            </svg>
            Se déconnecter
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", position: "relative", ...(isMobile ? { width: "100%" } : {}) }}>

        {/* TOPBAR */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e2eaf4", padding: isMobile ? "0 16px" : "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, flex: 1 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Icon d={ic.menu} size={22} stroke="#1e3a57" />
              </button>
            )}
            {!showSearch && <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "#1e3a57" }}>{pageTitle}</div>}
            {/* Barre de recherche */}
            {showSearch && (
              <div style={{ flex: 1, position: "relative" }}>
                <div style={{ position: "absolute", left: 10, top: "50%", transform: "translateY(-50%)", pointerEvents: "none" }}>
                  <Icon d={ic.search} size={15} stroke="#8da4c0" />
                </div>
                <input
                  autoFocus
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  placeholder="Rechercher un client, devis, document..."
                  style={{ width: "100%", padding: "8px 12px 8px 34px", borderRadius: 10, border: "1.5px solid #87CEEB", fontSize: 13, color: "#1e3a57", outline: "none", boxSizing: "border-box", background: "#f8fbff" }}
                  onKeyDown={e => { if (e.key === "Escape") { setShowSearch(false); setSearchQuery(""); } }}
                />
              </div>
            )}
          </div>
          <button onClick={() => { setShowSearch(s => !s); setSearchQuery(""); }}
            style={{ background: showSearch ? "#e8f0fb" : "none", border: showSearch ? "1px solid #c8ddf5" : "none", borderRadius: 8, cursor: "pointer", padding: 7, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Icon d={showSearch ? ic.close : ic.search} size={18} stroke={showSearch ? "#1a5c9e" : "#6b8aaa"} />
          </button>
        </header>

        {/* PANNEAU RÉSULTATS RECHERCHE */}
        {showSearch && searchQuery.trim().length >= 2 && (() => {
          const q = searchQuery.toLowerCase().trim();
          const results = [
            ...clients.filter(c => c.nom?.toLowerCase().includes(q) || c.secteur?.toLowerCase().includes(q) || c.nif?.toLowerCase().includes(q) || c.telephone?.toLowerCase().includes(q)).map(c => ({ type: "Client", label: c.nom, sub: c.secteur || c.forme_juridique || "", color: "#1a5c9e", bg: "#e8f0fb", emoji: "👥", action: () => { navigate("clients"); setShowSearch(false); setSearchQuery(""); } })),
            ...devisList.filter(d => d.client?.toLowerCase().includes(q) || d.numero?.toLowerCase().includes(q) || String(d.total_ttc).includes(q)).map(d => ({ type: "Devis", label: `Devis ${d.numero || ""} — ${d.client}`, sub: `${d.statut} — ${(d.total_ttc||0).toLocaleString("fr-FR")} FCFA`, color: "#1a7a4a", bg: "#e8f5ee", emoji: "📄", action: () => { navigate("devis"); setShowSearch(false); setSearchQuery(""); } })),
            ...abonnements.filter(a => a.client?.toLowerCase().includes(q) || a.service?.toLowerCase().includes(q)).map(a => ({ type: "Abonnement", label: a.client, sub: `${a.service} — ${a.statut}`, color: "#8e44ad", bg: "#f5eefb", emoji: "🔄", action: () => { navigate("abonnements"); setShowSearch(false); setSearchQuery(""); } })),
            ...depenses.filter(d => d.libelle?.toLowerCase().includes(q) || d.categorie?.toLowerCase().includes(q)).map(d => ({ type: "Dépense", label: d.libelle, sub: `${d.categorie} — ${(d.montant||0).toLocaleString("fr-FR")} FCFA`, color: "#c0392b", bg: "#fff0f0", emoji: "💸", action: () => { navigate("depenses"); setShowSearch(false); setSearchQuery(""); } })),
            ...documents.filter(d => d.nom?.toLowerCase().includes(q) || d.client?.toLowerCase().includes(q)).map(d => ({ type: "Document", label: d.nom, sub: d.client || "—", color: "#c17f2a", bg: "#fff8e6", emoji: "📎", action: () => { navigate("documents"); setShowSearch(false); setSearchQuery(""); } })),
            ...collaborateurs.filter(c => c.nom?.toLowerCase().includes(q) || c.role?.toLowerCase().includes(q) || c.email?.toLowerCase().includes(q)).map(c => ({ type: "Collaborateur", label: c.nom, sub: c.role || "", color: "#2980b9", bg: "#e8f4fb", emoji: "👤", action: () => { navigate("collab"); setShowSearch(false); setSearchQuery(""); } })),
          ].slice(0, 12);

          return (
            <div style={{ position: "absolute", top: 60, left: isMobile ? 0 : 280, right: 0, background: "#fff", borderBottom: "1px solid #e2eaf4", zIndex: 90, boxShadow: "0 8px 24px rgba(0,30,80,0.1)", maxHeight: 420, overflowY: "auto" }}>
              {results.length === 0 ? (
                <div style={{ padding: 24, textAlign: "center", color: "#8da4c0", fontSize: 13 }}>
                  Aucun résultat pour "<strong>{searchQuery}</strong>"
                </div>
              ) : (
                <div>
                  <div style={{ padding: "8px 16px", fontSize: 11, color: "#8da4c0", fontWeight: 700, textTransform: "uppercase", borderBottom: "1px solid #f0f4fa" }}>
                    {results.length} résultat(s) pour "{searchQuery}"
                  </div>
                  {results.map((r, i) => (
                    <div key={i} onClick={r.action} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 16px", borderBottom: "1px solid #f0f4fa", cursor: "pointer", transition: "background 0.15s" }}
                      onMouseEnter={e => e.currentTarget.style.background = "#f5f8fc"}
                      onMouseLeave={e => e.currentTarget.style.background = "#fff"}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: r.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, flexShrink: 0 }}>{r.emoji}</div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a57", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.label}</div>
                        <div style={{ fontSize: 11, color: "#8da4c0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{r.sub}</div>
                      </div>
                      <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: r.bg, color: r.color, flexShrink: 0 }}>{r.type}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}

        {/* CONTENT */}
        <div style={{ padding: isMobile ? 14 : 24, paddingBottom: isMobile ? 100 : 24, overflowY: "auto", flex: 1 }}>
          {loading ? <Spinner /> : <>

            {/* ── DASHBOARD ── */}
            {page === "dashboard" && (() => {
              const now = new Date();
              const annee = now.getFullYear();
              const moisNoms = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];

              // ── KPIs principaux ──
              const clientsActifs = clients.filter(c => c.statut === "Actif").length;
              const totalCA = devisList.filter(d => d.statut === "Payé").reduce((s, d) => s + (d.total_ttc || 0), 0);
              const devisEnAttente = devisList.filter(d => d.statut === "Enregistré" || d.statut === "Envoyé").length;
              const montantEnAttente = devisList.filter(d => d.statut === "Enregistré" || d.statut === "Envoyé").reduce((s, d) => s + (d.total_ttc || 0), 0);
              const freqMult = { "Mensuel": 1, "Trimestriel": 3, "Semestriel": 6, "Annuel": 12 };
              const mrr = abonnements.filter(a => a.statut === "Actif").reduce((s, a) => s + (a.montant || 0) / (freqMult[a.frequence] || 1), 0);
              const depensesTotal = depenses.filter(d => new Date(d.date).getFullYear() === annee).reduce((s, d) => s + (d.montant || 0), 0);

              // ── CA mensuel (12 derniers mois) ──
              const caMois = Array(12).fill(0);
              devisList.filter(d => d.statut === "Payé").forEach(d => {
                const date = new Date(d.date || d.created_at);
                if (date.getFullYear() === annee) caMois[date.getMonth()] += d.total_ttc || 0;
              });
              const maxCA = Math.max(...caMois, 1);

              // ── Devis par statut ──
              const statutsDevis = {
                "Payé": devisList.filter(d => d.statut === "Payé").length,
                "Enregistré": devisList.filter(d => d.statut === "Enregistré").length,
                "Brouillon": devisList.filter(d => d.statut === "Brouillon").length,
                "Annulé": devisList.filter(d => d.statut === "Annulé").length,
              };
              const totalDevis = devisList.length || 1;
              const tauxConversion = devisList.length > 0 ? Math.round((statutsDevis["Payé"] / devisList.length) * 100) : 0;

              // ── Dépenses ce mois ──
              const depMois = depenses.filter(d => {
                const dt = new Date(d.date);
                return dt.getFullYear() === annee && dt.getMonth() === now.getMonth();
              }).reduce((s, d) => s + (d.montant || 0), 0);

              // ── Activité récente — toutes sources ──
              const bestDate = (...vals) => {
                const dates = vals.map(v => v ? new Date(v) : null).filter(d => d && !isNaN(d));
                return dates.length ? dates.sort((a,b) => b-a)[0].toISOString() : null;
              };
              const activiteRecente = [
                ...devisList.map(d => ({ label: `Devis ${d.statut?.toLowerCase()} — ${d.client}`, montant: d.total_ttc, color: d.statut === "Payé" ? "#1a7a4a" : "#1a5c9e", emoji: d.statut === "Payé" ? "✅" : d.statut === "Annulé" ? "❌" : "📄", date: bestDate(d.updated_at, d.created_at, d.date) })),
                ...depenses.map(d => ({ label: `${d.libelle || "Dépense"} (${d.categorie || "—"})`, montant: -(d.montant || 0), color: "#c0392b", emoji: "💸", date: bestDate(d.updated_at, d.date, d.created_at) })),
                ...clients.map(c => ({ label: `Nouveau client — ${c.nom}`, montant: null, color: "#8e44ad", emoji: "🤝", date: bestDate(c.updated_at, c.created_at) })),
                ...abonnements.map(a => ({ label: `Abonnement ${a.statut?.toLowerCase() || ""} — ${a.client}`, montant: a.statut === "Actif" ? (a.montant || null) : null, color: a.statut === "Actif" ? "#1a7a4a" : a.statut === "Suspendu" ? "#c17f2a" : "#c0392b", emoji: a.statut === "Actif" ? "🔄" : a.statut === "Suspendu" ? "⏸️" : "🚫", date: bestDate(a.updated_at, a.created_at, a.date_debut) })),
                ...collaborateurs.map(c => ({ label: `Collaborateur ajouté — ${c.nom}`, montant: null, color: "#2980b9", emoji: "👤", date: bestDate(c.updated_at, c.created_at) })),
                ...documents.map(d => ({ label: `Document déposé — ${d.nom}`, montant: null, color: "#c17f2a", emoji: "📎", date: bestDate(d.updated_at, d.created_at) })),
              ].filter(a => a.label)
               .sort((a, b) => {
                 const da = a.date ? new Date(a.date) : new Date(0);
                 const db2 = b.date ? new Date(b.date) : new Date(0);
                 return db2 - da;
               })
               .slice(0, 10);

              // ── Abonnements à renouveler soon ──
              const abosSoon = abonnements.filter(a => {
                if (a.statut !== "Actif" || !a.prochaine_echeance) return false;
                const days = Math.round((new Date(a.prochaine_echeance) - now) / 86400000);
                return days >= 0 && days <= 30;
              });

              // ── Top clients (par CA devis payés) ──
              const caParClient = {};
              devisList.filter(d => d.statut === "Payé").forEach(d => {
                caParClient[d.client] = (caParClient[d.client] || 0) + (d.total_ttc || 0);
              });
              const topClients = Object.entries(caParClient).sort((a, b) => b[1] - a[1]).slice(0, 4);
              const maxTopCA = topClients[0]?.[1] || 1;

              const kpiCards = [
                { label: "Clients actifs", value: clientsActifs, delta: `${clients.length} au total`, color: "#1a5c9e", icon: ic.clients, bg: "#e8f0fb" },
                { label: "CA encaissé", value: totalCA > 0 ? (totalCA / 1000).toFixed(0) + "k FCFA" : "0 FCFA", delta: `${statutsDevis["Payé"]} devis payés`, color: "#1a7a4a", icon: ic.trend, bg: "#e8f5ee" },
                { label: "MRR", value: Math.round(mrr).toLocaleString("fr-FR") + " FCFA", delta: `${abonnements.filter(a => a.statut === "Actif").length} abonnés actifs`, color: "#8e44ad", icon: ic.abonnement, bg: "#f5eefb" },
                { label: "En attente", value: montantEnAttente > 0 ? (montantEnAttente / 1000).toFixed(0) + "k FCFA" : "0 FCFA", delta: `${devisEnAttente} devis à encaisser`, color: "#c17f2a", icon: ic.alert, bg: "#fff8e6" },
              ];

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* ── KPI CARDS ── */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 10 : 14 }}>
                    {kpiCards.map((k, i) => (
                      <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 14, padding: isMobile ? "14px" : "18px 20px", boxShadow: "0 1px 4px rgba(0,30,80,.07)", borderTop: `3px solid ${k.color}`, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 6 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon d={k.icon} size={18} stroke={k.color} />
                          </div>
                        </div>
                        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#1e3a57", lineHeight: 1.1 }}>{k.value}</div>
                        <div style={{ fontSize: isMobile ? 11 : 12, color: "#6b8aaa", fontWeight: 600 }}>{k.label}</div>
                        <div style={{ fontSize: 11, color: "#8da4c0" }}>{k.delta}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── ROW 2 : Graphiques ── */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>

                    {/* Graphique CA mensuel (barres SVG) */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}>
                        <Icon d={ic.rapports} size={16} stroke="#1a5c9e" />
                        <span style={S.cardTitle}>CA encaissé — {annee}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "#e8f0fb", color: "#1a5c9e", padding: "3px 8px", borderRadius: 6 }}>
                          {totalCA > 0 ? (totalCA / 1000).toFixed(0) + "k FCFA" : "—"}
                        </span>
                      </div>
                      {devisList.filter(d => d.statut === "Payé").length === 0 ? (
                        <div style={S.empty}>Aucun devis payé cette année</div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 3 : 5, height: 120, padding: "0 4px" }}>
                          {caMois.map((val, i) => {
                            const h = maxCA > 0 ? Math.max((val / maxCA) * 100, val > 0 ? 8 : 0) : 0;
                            const isCurrentMonth = i === now.getMonth();
                            return (
                              <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                                <div title={`${moisNoms[i]}: ${val.toLocaleString("fr-FR")} FCFA`} style={{
                                  width: "100%", height: `${h}%`, minHeight: val > 0 ? 4 : 0,
                                  background: isCurrentMonth ? "linear-gradient(180deg,#2e7fcf,#1a5c9e)" : val > 0 ? "#c8ddf5" : "#f0f4fa",
                                  borderRadius: "3px 3px 0 0",
                                  transition: "height 0.5s ease",
                                  cursor: "pointer",
                                  boxShadow: isCurrentMonth ? "0 2px 8px rgba(26,92,158,0.3)" : "none",
                                }} />
                                <span style={{ fontSize: 9, color: isCurrentMonth ? "#1a5c9e" : "#8da4c0", fontWeight: isCurrentMonth ? 700 : 400 }}>{moisNoms[i]}</span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Donut devis par statut */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}>
                        <Icon d={ic.devis} size={16} stroke="#1a7a4a" />
                        <span style={S.cardTitle}>Statut des devis</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "#e8f5ee", color: "#1a7a4a", padding: "3px 8px", borderRadius: 6 }}>
                          {tauxConversion}% conversion
                        </span>
                      </div>
                      {devisList.length === 0 ? (
                        <div style={S.empty}>Aucun devis enregistré</div>
                      ) : (
                        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
                          {/* Donut SVG */}
                          {(() => {
                            const data = [
                              { label: "Payé", value: statutsDevis["Payé"], color: "#1a7a4a" },
                              { label: "Enregistré", value: statutsDevis["Enregistré"], color: "#1a5c9e" },
                              { label: "Brouillon", value: statutsDevis["Brouillon"], color: "#c17f2a" },
                              { label: "Annulé", value: statutsDevis["Annulé"], color: "#c0392b" },
                            ].filter(d => d.value > 0);
                            const total = data.reduce((s, d) => s + d.value, 0) || 1;
                            const r = 36, cx = 44, cy = 44, stroke = 10;
                            let offset = -Math.PI / 2;
                            const arcs = data.map(d => {
                              const angle = (d.value / total) * 2 * Math.PI;
                              const x1 = cx + r * Math.cos(offset);
                              const y1 = cy + r * Math.sin(offset);
                              offset += angle;
                              const x2 = cx + r * Math.cos(offset);
                              const y2 = cy + r * Math.sin(offset);
                              const large = angle > Math.PI ? 1 : 0;
                              return { ...d, path: `M ${x1} ${y1} A ${r} ${r} 0 ${large} 1 ${x2} ${y2}`, angle };
                            });
                            return (
                              <svg width={88} height={88} style={{ flexShrink: 0 }}>
                                <circle cx={cx} cy={cy} r={r} fill="none" stroke="#f0f4fa" strokeWidth={stroke} />
                                {arcs.map((arc, i) => (
                                  <path key={i} d={arc.path} fill="none" stroke={arc.color} strokeWidth={stroke} strokeLinecap="butt" />
                                ))}
                                <text x={cx} y={cy - 4} textAnchor="middle" fontSize="14" fontWeight="800" fill="#1e3a57">{total}</text>
                                <text x={cx} y={cy + 10} textAnchor="middle" fontSize="9" fill="#8da4c0">devis</text>
                              </svg>
                            );
                          })()}
                          {/* Légende */}
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: 8 }}>
                            {[
                              { label: "Payé", count: statutsDevis["Payé"], color: "#1a7a4a" },
                              { label: "Enregistré", count: statutsDevis["Enregistré"], color: "#1a5c9e" },
                              { label: "Brouillon", count: statutsDevis["Brouillon"], color: "#c17f2a" },
                              { label: "Annulé", count: statutsDevis["Annulé"], color: "#c0392b" },
                            ].map((item, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8 }}>
                                <div style={{ width: 10, height: 10, borderRadius: "50%", background: item.color, flexShrink: 0 }} />
                                <span style={{ fontSize: 12, color: "#4a6d8c", flex: 1 }}>{item.label}</span>
                                <span style={{ fontSize: 12, fontWeight: 700, color: "#1e3a57" }}>{item.count}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── ROW 2.5 : Échéances fiscales à venir ── */}
                  {(() => {
                    const echSoon = echeances.filter(e => {
                      if (e.statut === "Fait") return false;
                      const days = Math.round((new Date(e.date_echeance) - now) / 86400000);
                      return days >= -7 && days <= 30;
                    }).sort((a, b) => new Date(a.date_echeance) - new Date(b.date_echeance)).slice(0, 5);

                    if (echSoon.length === 0) return null;
                    return (
                      <div className="card-hover" style={S.card}>
                        <div style={S.cardHeader}>
                          <Icon d={ic.calendar} size={16} stroke="#1a5c9e" />
                          <span style={S.cardTitle}>Échéances fiscales à venir</span>
                          <button onClick={() => navigate("echeances")} style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "#e8f0fb", color: "#1a5c9e", padding: "3px 8px", borderRadius: 6, border: "none", cursor: "pointer" }}>Voir tout →</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {echSoon.map((e, i) => {
                            const days = Math.round((new Date(e.date_echeance) - now) / 86400000);
                            const isLate = days < 0;
                            const isUrgent = days >= 0 && days <= 7;
                            return (
                              <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < echSoon.length - 1 ? "1px solid #f0f4fa" : "none" }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: isLate ? "#fff0f0" : isUrgent ? "#fff8e6" : "#e8f0fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                                  {isLate ? "🔴" : isUrgent ? "🟡" : "📅"}
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.client}</div>
                                  <div style={{ fontSize: 11, color: "#8da4c0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{e.type}</div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: isLate ? "#c0392b" : isUrgent ? "#c17f2a" : "#1a5c9e" }}>
                                    {isLate ? `J+${Math.abs(days)}` : days === 0 ? "Aujourd'hui" : `J-${days}`}
                                  </div>
                                  <div style={{ fontSize: 10, color: "#8da4c0" }}>{new Date(e.date_echeance).toLocaleDateString("fr-FR")}</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── ROW 3 : Top clients + Activité récente ── */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>

                    {/* Alertes abonnements */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}>
                        <Icon d={ic.alert} size={16} stroke="#c0392b" />
                        <span style={S.cardTitle}>Abonnements à renouveler</span>
                        {abosSoon.length > 0 && <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "#fff0f0", color: "#c0392b", padding: "3px 8px", borderRadius: 6 }}>{abosSoon.length} dans 30j</span>}
                      </div>
                      {abosSoon.length === 0 ? (
                        <div style={S.empty}>✅ Aucune échéance dans les 30 prochains jours</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {abosSoon.map((a, i) => {
                            const days = Math.round((new Date(a.prochaine_echeance) - now) / 86400000);
                            return (
                              <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < abosSoon.length - 1 ? "1px solid #f0f4fa" : "none" }}>
                                <div style={{ width: 30, height: 30, borderRadius: 8, background: days <= 7 ? "#fff0f0" : "#fff8e6", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13, flexShrink: 0 }}>
                                  {days <= 7 ? "🔴" : "🟡"}
                                </div>
                                <div style={{ flex: 1 }}>
                                  <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{a.client}</div>
                                  <div style={{ fontSize: 11, color: "#8da4c0" }}>{a.service}</div>
                                </div>
                                <div style={{ textAlign: "right", flexShrink: 0 }}>
                                  <div style={{ fontSize: 12, fontWeight: 700, color: days <= 7 ? "#c0392b" : "#c17f2a" }}>J-{days}</div>
                                  <div style={{ fontSize: 11, color: "#8da4c0" }}>{(a.montant || 0).toLocaleString("fr-FR")} FCFA</div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    {/* Activité récente */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}>
                        <Icon d={ic.bell} size={16} stroke="#c17f2a" />
                        <span style={S.cardTitle}>Activité récente</span>
                      </div>
                      {activiteRecente.length === 0 ? (
                        <div style={S.empty}>Aucune activité récente</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                          {activiteRecente.map((item, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 0", borderBottom: i < activiteRecente.length - 1 ? "1px solid #f0f4fa" : "none" }}>
                              <div style={{ width: 30, height: 30, borderRadius: 8, background: item.color + "18", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14, flexShrink: 0 }}>{item.emoji}</div>
                              <div style={{ flex: 1, minWidth: 0 }}>
                                <div style={{ fontSize: 12, fontWeight: 500, color: "#1e3a57", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{item.label}</div>
                                <div style={{ fontSize: 10, color: "#8da4c0" }}>{item.date ? new Date(item.date).toLocaleDateString("fr-FR") : "—"}</div>
                              </div>
                              {item.montant !== null && item.montant !== undefined ? (
                                <div style={{ fontSize: 12, fontWeight: 700, color: item.montant > 0 ? "#1a7a4a" : "#c0392b", flexShrink: 0 }}>
                                  {item.montant > 0 ? "+" : ""}{Math.abs(item.montant).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA
                                </div>
                              ) : null}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── ROW 4 : Alertes + Dépenses vs MRR ── */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>

                    {/* Top clients */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}>
                        <Icon d={ic.clients} size={16} stroke="#8e44ad" />
                        <span style={S.cardTitle}>Top clients (CA)</span>
                      </div>
                      {topClients.length === 0 ? (
                        <div style={S.empty}>Aucun devis payé pour l'instant</div>
                      ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {topClients.map(([nom, ca], i) => (
                            <div key={nom} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: ["linear-gradient(135deg,#f6c90e,#e8a400)","#e8e8e8","#cd7f32","#e8f0fb"][i] || "#e8f0fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i === 0 ? "#7a5000" : "#6b8aaa", flexShrink: 0 }}>
                                {i + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{nom}</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a5c9e" }}>{ca.toLocaleString("fr-FR")} FCFA</span>
                                </div>
                                <div style={{ height: 5, background: "#f0f4fa", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ width: `${(ca / maxTopCA) * 100}%`, height: "100%", background: i === 0 ? "linear-gradient(90deg,#f6c90e,#e8a400)" : "#c8ddf5", borderRadius: 3 }} />
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Revenus vs Dépenses */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}>
                        <Icon d={ic.trend} size={16} stroke="#1a5c9e" />
                        <span style={S.cardTitle}>Synthèse financière {annee}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                        {[
                          { label: "CA encaissé", value: totalCA, color: "#1a7a4a", bg: "#e8f5ee", icon: "📈" },
                          { label: "MRR (revenu mensuel)", value: Math.round(mrr), color: "#8e44ad", bg: "#f5eefb", icon: "🔄" },
                          { label: "Dépenses ce mois", value: depMois, color: "#c0392b", bg: "#fff0f0", icon: "📉" },
                          { label: "Dépenses cette année", value: depensesTotal, color: "#c17f2a", bg: "#fff8e6", icon: "💸" },
                        ].map((item, i) => (
                          <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", borderRadius: 9, background: item.bg }}>
                            <span style={{ fontSize: 16 }}>{item.icon}</span>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 11, color: "#6b8aaa", fontWeight: 500 }}>{item.label}</div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: item.color }}>
                                {item.value.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA
                              </div>
                            </div>
                          </div>
                        ))}
                        {totalCA > 0 && depensesTotal > 0 && (
                          <div style={{ padding: "10px 12px", borderRadius: 9, background: totalCA > depensesTotal ? "#e8f5ee" : "#fff0f0", border: `1px solid ${totalCA > depensesTotal ? "#1a7a4a" : "#c0392b"}22` }}>
                            <div style={{ fontSize: 11, color: "#6b8aaa" }}>Résultat net estimé</div>
                            <div style={{ fontSize: 16, fontWeight: 800, color: totalCA > depensesTotal ? "#1a7a4a" : "#c0392b" }}>
                              {totalCA > depensesTotal ? "+" : ""}{(totalCA - depensesTotal).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* ── CLIENTS ── */}
            {page === "clients" && (
              <div>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {["Tous", "Actif", "En attente", "Inactif"].map(f => (
                      <button key={f} onClick={() => setClientFilter(f)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2eaf4", background: clientFilter === f ? "#1a5c9e" : "#fff", color: clientFilter === f ? "#fff" : "#4a6d8c", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{f}</button>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f8fc", border: "1px solid #87CEEB", borderRadius: 8, padding: "7px 14px" }}>
                      <Icon d={ic.search} size={15} stroke="#8da4c0" />
                      <input placeholder="Rechercher un client…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1e3a57", width: 160 }} />
                    </div>
                    {canDo("clients","ajouter") && <button onClick={() => setShowAddClient(true)} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Nouveau</button>}
                  </div>
                </div>
                {isMobile ? (
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {filteredClients.length === 0 && <div style={{ ...S.card, ...S.empty }}>Aucun client trouvé</div>}
                    {filteredClients.map(c => (
                      <div key={c.id} style={{ ...S.card, padding: "14px 16px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                          <div style={{ width: 36, height: 36, borderRadius: 9, background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0 }}>{c.nom?.charAt(0) || "?"}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a57" }}>{c.nom}</div>
                            <div style={{ fontSize: 12, color: "#6b8aaa" }}>{c.secteur}</div>
                          </div>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: c.statut === "Actif" ? "#e8f5ee" : c.statut === "En attente" ? "#fff8e6" : "#f5f5f5", color: c.statut === "Actif" ? "#1a7a4a" : c.statut === "En attente" ? "#c17f2a" : "#8a9aac" }}>{c.statut}</span>
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                          <div>
                            <span style={{ fontSize: 12, color: "#8da4c0" }}>CA : </span>
                            <span style={{ fontSize: 13, fontWeight: 600, color: "#1e3a57" }}>{c.ca}</span>
                          </div>
                          <div style={{ display: "flex", gap: 6 }}>
                            <button onClick={() => setViewClient(c)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                              <Icon d={ic.eye} size={14} stroke="#1a5c9e" />
                            </button>
                            {canDo("clients","modifier") && <button onClick={() => setEditClient({ ...c })} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.edit} size={14} stroke="#1a7a4a" /></button>}
                            {canDo("clients","supprimer") && <button onClick={() => deleteClient(c.id)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={14} stroke="#c0392b" /></button>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,30,80,.06)" }}>
                    <div style={{ display: "flex", padding: "12px 20px", background: "#f5f8fc", borderBottom: "1px solid #e2eaf4", fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", letterSpacing: 0.5 }}>
                      <div style={{ flex: 2.5 }}>Client</div><div style={{ flex: 1.2 }}>Secteur</div><div style={{ flex: 1 }}>CA</div><div style={{ flex: 1.2 }}>Responsable</div><div style={{ flex: 0.8, textAlign: "center" }}>Statut</div><div style={{ flex: 0.5, textAlign: "center" }}>Action</div>
                    </div>
                    {filteredClients.length === 0 && <div style={{ ...S.empty, padding: 24 }}>Aucun client trouvé</div>}
                    {filteredClients.map(c => (
                      <div key={c.id} className="row-hover" style={{ display: "flex", alignItems: "center", padding: "13px 20px", borderBottom: "1px solid #f0f4fa", cursor: "pointer" }}>
                        <div style={{ flex: 2.5, display: "flex", alignItems: "center", gap: 10 }}>
                          <div style={{ width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 }}>{c.nom?.charAt(0) || "?"}</div>
                          <span style={{ fontWeight: 600, color: "#1e3a57", fontSize: 13 }}>{c.nom}</span>
                        </div>
                        <div style={{ flex: 1.2, fontSize: 13, color: "#4a6d8c" }}>{c.secteur}</div>
                        <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1e3a57" }}>{c.ca}</div>
                        <div style={{ flex: 1.2, fontSize: 13, color: "#4a6d8c" }}>{c.responsable}</div>
                        <div style={{ flex: 0.8, textAlign: "center" }}>
                          <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: c.statut === "Actif" ? "#e8f5ee" : c.statut === "En attente" ? "#fff8e6" : "#f5f5f5", color: c.statut === "Actif" ? "#1a7a4a" : c.statut === "En attente" ? "#c17f2a" : "#8a9aac" }}>{c.statut}</span>
                        </div>
                        <div style={{ flex: 0.5, textAlign: "center", display: "flex", gap: 6, justifyContent: "center" }}>
                          <button onClick={() => setViewClient(c)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                            <Icon d={ic.eye} size={14} stroke="#1a5c9e" />
                          </button>
                          {canDo("clients","modifier") && <button onClick={() => setEditClient({ ...c })} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #d4ecd4", background: "#f0faf0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.edit} size={14} stroke="#1a7a4a" /></button>}
                          {canDo("clients","supprimer") && <button onClick={() => deleteClient(c.id)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={14} stroke="#c0392b" /></button>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

{/* ── DEVIS ── */}
            {page === "devis" && (() => {
              // Build missions list from real services + defaults
              const DEFAULTS = [
                { nom: "Conseils et stratégies financiers", groupe: "Assistance Comptable" },
                { nom: "Analyse et diagnostic financier", groupe: "Assistance Comptable" },
                { nom: "Ingénierie financière", groupe: "Assistance Comptable" },
                { nom: "Installation et paramétrage de logiciel de gestion", groupe: "Assistance Comptable" },
                { nom: "Production des états financiers (DSF - CEP - PT)", groupe: "Assistance Comptable" },
                { nom: "Audit comptable", groupe: "Assistance Comptable" },
                { nom: "Manuel de procédures", groupe: "Assistance Comptable" },
                { nom: "Déclaration fiscale (TVA - AIR/AIS - RTS - DSF)", groupe: "Assistance Fiscale" },
                { nom: "Respect des échéances fiscales", groupe: "Assistance Fiscale" },
                { nom: "Élaboration des correspondances fiscales", groupe: "Assistance Fiscale" },
                { nom: "Mesures de sécurité juridico-fiscales", groupe: "Assistance Fiscale" },
                { nom: "Optimisation fiscale légale", groupe: "Assistance Fiscale" },
                { nom: "Audit et simulation fiscale avant dépôt DSF", groupe: "Assistance Fiscale" },
                { nom: "Constitution d'office en phase juridictionnelle", groupe: "Assistance Fiscale" },
                { nom: "Déclarations sociales", groupe: "Assistance Sociale" },
                { nom: "Respect des échéances sociales", groupe: "Assistance Sociale" },
                { nom: "Élaboration des correspondances sociales", groupe: "Assistance Sociale" },
                { nom: "Mesures de sécurité juridico-sociales", groupe: "Assistance Sociale" },
                { nom: "Optimisation sociales annuelles légales", groupe: "Assistance Sociale" },
                { nom: "Rédaction des contrats", groupe: "Assistance Juridique" },
                { nom: "Rédaction des statuts sous seing privé", groupe: "Assistance Juridique" },
                { nom: "Aide à la création d'entreprise", groupe: "Assistance Juridique" },
                { nom: "Formation du personnel interne", groupe: "Assistance Juridique" },
              ];

              const allMissions = [
                ...DEFAULTS.map(d => {
                  const dbS = services.find(s => s.nom === d.nom && s.groupe === d.groupe);
                  return { nom: d.nom, groupe: d.groupe, tarif: dbS?.tarif || 0, unite: dbS?.unite || "forfait" };
                }),
                ...services.filter(s => !DEFAULTS.find(d => d.nom === s.nom && d.groupe === s.groupe))
                  .map(s => ({ nom: s.nom, groupe: s.groupe, tarif: s.tarif || 0, unite: s.unite || "forfait" }))
              ];

              // Numéro devis auto
              const nextNum = "DEV-" + String((devisList.length + 1)).padStart(4, "0") + "-" + new Date().getFullYear();
              const selectedClientData = clients.find(c => c.nom === devisClient);
              const totalHT = devisLines.reduce((s, l) => s + (l.tarif || 0) * l.qty, 0);
              const totalTTC = totalHT * 1.1925;

              return (
                <div style={{ maxWidth: 860 }}>
                  <div className="card-hover" style={S.card}>
                    <div style={S.cardHeader}>
                      <Icon d={ic.devis} size={16} stroke={editingDevisId ? "#1a7a4a" : "#1a5c9e"} />
                      <span style={S.cardTitle}>{editingDevisId ? "✏️ Modifier le brouillon" : "Nouveau devis"}</span>
                      <span style={{ marginLeft: "auto", fontSize: 12, fontWeight: 700, color: editingDevisId ? "#1a7a4a" : "#1a5c9e", background: editingDevisId ? "#e8f5ee" : "#e8f0fb", padding: "4px 10px", borderRadius: 8 }}>{nextNum}</span>
                    </div>

                    {/* Infos client + date */}
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr", gap: 12, marginBottom: 20, padding: "16px", background: "#f5f8fc", borderRadius: 10 }}>
                      <div style={S.formGroup}>
                        <label style={S.label}>Client *</label>
                        <div style={{ position: "relative" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #87CEEB", borderRadius: 8, padding: "8px 12px", background: "#fff", cursor: "pointer" }} onClick={() => setShowClientDropdown(v => !v)}>
                            <span style={{ flex: 1, fontSize: 13, color: devisClient ? "#1e3a57" : "#8da4c0" }}>{devisClient || "Sélectionner un client…"}</span>
                            <Icon d={ic.search} size={14} stroke="#8da4c0" />
                          </div>
                          {showClientDropdown && (
                            <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #87CEEB", borderRadius: 8, zIndex: 200, boxShadow: "0 8px 24px rgba(0,30,80,0.12)", marginTop: 4 }}>
                              <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0f4fa" }}>
                                <input autoFocus placeholder="Rechercher un client…" value={devisClientSearch} onChange={e => setDevisClientSearch(e.target.value)} style={{ width: "100%", border: "none", outline: "none", fontSize: 13, color: "#1e3a57", background: "transparent" }} />
                              </div>
                              <div style={{ maxHeight: 200, overflowY: "auto" }}>
                                {clients.filter(c => c.nom.toLowerCase().includes(devisClientSearch.toLowerCase())).map(c => (
                                  <div key={c.id} onClick={() => { setDevisClient(c.nom); setShowClientDropdown(false); setDevisClientSearch(""); }} style={{ padding: "10px 14px", cursor: "pointer", fontSize: 13, color: "#1e3a57", borderBottom: "1px solid #f5f8fc", background: devisClient === c.nom ? "#e8f0fb" : "transparent", fontWeight: devisClient === c.nom ? 700 : 400 }}>
                                    <div>{c.nom}</div>
                                    {c.secteur && <div style={{ fontSize: 11, color: "#8da4c0" }}>{c.secteur}</div>}
                                  </div>
                                ))}
                                {clients.filter(c => c.nom.toLowerCase().includes(devisClientSearch.toLowerCase())).length === 0 && (
                                  <div style={{ padding: "12px 14px", fontSize: 13, color: "#8da4c0", textAlign: "center" }}>Aucun client trouvé</div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={S.formGroup}>
                        <label style={S.label}>Date</label>
                        <input type="date" value={devisDate} onChange={e => setDevisDate(e.target.value)} style={S.select} />
                      </div>
                      <div style={S.formGroup}>
                        <label style={S.label}>N° Devis</label>
                        <input value={nextNum} readOnly style={{ ...S.select, background: "#e8f0fb", color: "#1a5c9e", fontWeight: 700 }} />
                      </div>
                      {selectedClientData && (
                        <div style={{ gridColumn: isMobile ? "1" : "1 / -1", display: "flex", gap: 16, flexWrap: "wrap" }}>
                          {selectedClientData.secteur && <span style={{ fontSize: 12, color: "#6b8aaa" }}>Secteur : <b style={{ color: "#1e3a57" }}>{selectedClientData.secteur}</b></span>}
                          {selectedClientData.responsable && <span style={{ fontSize: 12, color: "#6b8aaa" }}>Responsable : <b style={{ color: "#1e3a57" }}>{selectedClientData.responsable}</b></span>}
                          {selectedClientData.ca && <span style={{ fontSize: 12, color: "#6b8aaa" }}>CA : <b style={{ color: "#1e3a57" }}>{selectedClientData.ca}</b></span>}
                        </div>
                      )}
                    </div>

                    {/* Lignes devis */}
                    <div style={{ marginBottom: 8 }}>
                      <div style={{ display: "flex", padding: "8px 0", borderBottom: "2px solid #e2eaf4", fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", letterSpacing: 0.5, gap: 8 }}>
                        <div style={{ flex: 3 }}>Service</div>
                        <div style={{ flex: 1.2 }}>Groupe</div>
                        <div style={{ width: 60, textAlign: "center" }}>Qté</div>
                        <div style={{ width: 130, textAlign: "right" }}>P.U. HT (FCFA)</div>
                        <div style={{ width: 130, textAlign: "right" }}>Total HT</div>
                        <div style={{ width: 32 }} />
                      </div>

                      {devisLines.map((line, i) => (
                        <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, padding: "10px 0", borderBottom: "1px solid #f0f4fa", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                          <div style={{ flex: 3, minWidth: isMobile ? "100%" : "auto", position: "relative" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: 8, border: "1px solid #87CEEB", borderRadius: 8, padding: "8px 10px", background: "#fff", cursor: "pointer", fontSize: 12 }} onClick={() => setShowServiceDropdown(showServiceDropdown === i ? null : i)}>
                              <span style={{ flex: 1, color: line.nom ? "#1e3a57" : "#8da4c0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{line.nom || "Sélectionner un service…"}</span>
                              <Icon d={ic.search} size={13} stroke="#8da4c0" />
                            </div>
                            {showServiceDropdown === i && (
                              <div style={{ position: "absolute", top: "100%", left: 0, right: 0, background: "#fff", border: "1px solid #87CEEB", borderRadius: 8, zIndex: 200, boxShadow: "0 8px 24px rgba(0,30,80,0.12)", marginTop: 4, minWidth: 320 }}>
                                <div style={{ padding: "8px 10px", borderBottom: "1px solid #f0f4fa" }}>
                                  <input autoFocus placeholder="Rechercher un service…" value={devisServiceSearch} onChange={e => setDevisServiceSearch(e.target.value)} style={{ width: "100%", border: "none", outline: "none", fontSize: 12, color: "#1e3a57", background: "transparent" }} />
                                </div>
                                <div style={{ maxHeight: 250, overflowY: "auto" }}>
                                  {["Assistance Comptable","Assistance Fiscale","Assistance Sociale","Assistance Juridique"].map(groupe => {
                                    const filtered = allMissions.filter(m => m.groupe === groupe && m.nom.toLowerCase().includes(devisServiceSearch.toLowerCase()));
                                    if (filtered.length === 0) return null;
                                    return (
                                      <div key={groupe}>
                                        <div style={{ padding: "6px 12px", fontSize: 10, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", background: "#f5f8fc", letterSpacing: 0.5 }}>{groupe}</div>
                                        {filtered.map(m => (
                                          <div key={m.nom} onClick={() => { updateLine(i, "full", m); setShowServiceDropdown(null); setDevisServiceSearch(""); }} style={{ padding: "9px 14px", cursor: "pointer", fontSize: 12, color: "#1e3a57", borderBottom: "1px solid #f5f8fc", background: line.nom === m.nom ? "#e8f0fb" : "transparent" }}>
                                            <div style={{ fontWeight: line.nom === m.nom ? 700 : 400 }}>{m.nom}</div>
                                            {m.tarif > 0 && <div style={{ fontSize: 11, color: "#1a5c9e", fontWeight: 600 }}>{m.tarif.toLocaleString("fr-FR")} FCFA / {m.unite}</div>}
                                          </div>
                                        ))}
                                      </div>
                                    );
                                  })}
                                  {allMissions.filter(m => m.nom.toLowerCase().includes(devisServiceSearch.toLowerCase())).length === 0 && (
                                    <div style={{ padding: "12px 14px", fontSize: 12, color: "#8da4c0", textAlign: "center" }}>Aucun service trouvé</div>
                                  )}
                                </div>
                              </div>
                            )}
                          </div>
                          <div style={{ flex: 1.2, fontSize: 11, color: "#6b8aaa", display: isMobile ? "none" : "block" }}>{line.groupe || "—"}</div>
                          <div style={{ width: 60 }}>
                            <input type="number" min={1} value={line.qty} onChange={e => updateLine(i, "qty", parseInt(e.target.value) || 1)} style={{ ...S.select, width: "100%", textAlign: "center", padding: "8px 4px" }} />
                          </div>
                          <div style={{ width: 130 }}>
                            <input type="number" value={line.tarif || 0} onChange={e => updateLine(i, "tarif", parseFloat(e.target.value) || 0)} style={{ ...S.select, width: "100%", textAlign: "right", padding: "8px 6px" }} />
                          </div>
                          <div style={{ width: 130, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#1a5c9e" }}>{((line.tarif || 0) * line.qty).toLocaleString("fr-FR")} FCFA</div>
                          <button onClick={() => removeLine(i)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2eaf4", background: "#fff", cursor: "pointer", color: "#c0392b", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
                        </div>
                      ))}
                    </div>

                    <button onClick={addLine} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 0", background: "none", border: "none", cursor: "pointer", color: "#1a5c9e", fontSize: 13, fontWeight: 600, marginTop: 8 }}>
                      <Icon d={ic.plus} size={14} stroke="#1a5c9e" /> Ajouter une ligne
                    </button>

                    {/* Totaux */}
                    <div style={{ background: "#f5f8fc", borderRadius: 10, padding: "16px 20px", marginTop: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#1e3a57", marginBottom: 8 }}>
                        <span style={{ color: "#6b8aaa" }}>Total HT</span>
                        <span style={{ fontWeight: 600 }}>{totalHT.toLocaleString("fr-FR")} FCFA</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#1e3a57", marginBottom: 8 }}>
                        <span style={{ color: "#6b8aaa" }}>TVA (19.25%)</span>
                        <span style={{ fontWeight: 600 }}>{(totalHT * 0.1925).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #1a5c9e", paddingTop: 12, marginTop: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "#1e3a57" }}>Total TTC</span>
                        <span style={{ fontWeight: 800, fontSize: 20, color: "#1a5c9e" }}>{(totalHT * 1.1925).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA</span>
                      </div>
                    </div>

                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16, flexWrap: "wrap" }}>
                      <button onClick={() => { setEditingDevisId(null); setDevisLines([{ nom: "", groupe: "", tarif: 0, unite: "forfait", qty: 1 }]); setDevisClient(clients[0]?.nom || ""); }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>
                        🔄 Réinitialiser
                      </button>
                      <button onClick={() => saveDevis("Brouillon")} disabled={devisSaving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, background: "#fff8e6", color: "#c17f2a", border: "1px solid #f0d080", cursor: "pointer", fontSize: 13 }}>
                        {devisSaving ? "…" : "💾 Brouillon"}
                      </button>
                      <button onClick={() => {
                        const clientData = clients.find(c => c.nom === devisClient);
                        const num = editingDevisId ? ("DEV-" + String(devisList.findIndex(d => d.id === editingDevisId) + 1).padStart(4,"0") + "-" + new Date().getFullYear()) : ("DEV-" + String((devisList.length + 1)).padStart(4, "0") + "-" + new Date().getFullYear());
                        setPreviewDevis({ client: devisClient, clientData, date: devisDate, total_ht: totalHT, total_ttc: totalHT * 1.1925, lignes: devisLines, num });
                        setShowPreview(true);
                      }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, background: "#f0f6ff", color: "#1a5c9e", border: "1px solid #c0d8f0", cursor: "pointer", fontSize: 13 }}>
                        <Icon d={ic.eye} size={14} stroke="#1a5c9e" /> Aperçu
                      </button>
                      {editingDevisId ? (
                        canDo("devis","modifier") && <button onClick={() => updateDevis(editingDevisId, "Enregistré")} disabled={devisSaving} style={{ ...S.primaryBtn, background: "#1a7a4a" }}>
                          <Icon d={ic.check} size={14} stroke="#fff" />{devisSaving ? "…" : "Mettre à jour"}
                        </button>
                      ) : (
                        canDo("devis","ajouter") && <button onClick={() => saveDevis("Enregistré")} disabled={devisSaving} style={S.primaryBtn}>
                          <Icon d={ic.send} size={14} stroke="#fff" />{devisSaving ? "…" : "Enregistrer"}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Historique */}
                  {devisList.length > 0 && (
                    <div className="card-hover" style={{ ...S.card, marginTop: 14 }}>
                      <div style={S.cardHeader}><Icon d={ic.folder} size={16} stroke="#4a6d8c" /><span style={S.cardTitle}>Historique des devis</span></div>
                      {devisList.map((d, idx) => (
                        <div key={d.id} style={{
                          display: "flex", alignItems: "center", gap: 10, padding: "12px 14px", borderBottom: "1px solid #f0f4fa", flexWrap: "wrap",
                          background: d.statut === "Payé" ? "linear-gradient(135deg, #e8f5ee, #f0faf4)" : d.statut === "Annulé" ? "#fff9f9" : d.statut === "Brouillon" ? "#fafafa" : "#fff",
                          borderLeft: d.statut === "Payé" ? "4px solid #1a7a4a" : d.statut === "Annulé" ? "4px solid #c0392b" : d.statut === "Brouillon" ? "4px solid #ccc" : "4px solid #1a5c9e",
                          borderRadius: 8, marginBottom: 6,
                          boxShadow: d.statut === "Payé" ? "0 2px 12px rgba(26,122,74,0.12)" : "0 1px 3px rgba(0,30,80,0.04)",
                          opacity: d.statut === "Annulé" ? 0.6 : 1,
                          transition: "all 0.3s ease",
                        }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
                            <div style={{ fontSize: 11, fontWeight: 700, color: "#1a5c9e", background: "#e8f0fb", padding: "3px 8px", borderRadius: 6 }}>{"DEV-" + String(devisList.length - idx).padStart(4, "0") + "-" + new Date(d.created_at || d.date).getFullYear()}</div>
                            {d.statut === "Payé" && (
                              <div style={{ display: "flex", alignItems: "center", gap: 4, background: "linear-gradient(135deg,#1a7a4a,#27ae60)", color: "#fff", fontSize: 11, fontWeight: 800, padding: "3px 10px", borderRadius: 20, boxShadow: "0 2px 8px rgba(26,122,74,0.35)", letterSpacing: 0.5, textTransform: "uppercase" }}>
                                ✅ PAYÉ
                              </div>
                            )}
                            {d.date_paiement && d.statut === "Payé" && (
                              <div style={{ fontSize: 10, color: "#1a7a4a", fontWeight: 600 }}>le {new Date(d.date_paiement).toLocaleDateString("fr-FR")}</div>
                            )}
                          </div>
                          <div style={{ flex: 2 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a57" }}>{d.client}</div>
                            <div style={{ fontSize: 11, color: "#8da4c0" }}>{d.date ? new Date(d.date).toLocaleDateString("fr-FR") : "—"}</div>
                          </div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1a5c9e" }}>{(d.total_ttc || 0).toLocaleString("fr-FR", { maximumFractionDigits: 0 })} FCFA TTC</div>
                          <span style={{
                            fontSize: 11, fontWeight: 700, borderRadius: 20, flexShrink: 0, display: "inline-flex", alignItems: "center", gap: 4,
                            padding: d.statut === "Payé" ? "6px 14px" : "4px 10px",
                            letterSpacing: d.statut === "Payé" ? 0.5 : 0,
                            border: d.statut === "Payé" ? "2px solid #1a7a4a" : d.statut === "Enregistré" ? "2px solid #1a5c9e" : d.statut === "Annulé" ? "2px solid #c0392b" : "2px solid #ccc",
                            background: d.statut === "Payé" ? "linear-gradient(135deg,#1a7a4a,#27ae60)" : d.statut === "Enregistré" ? "#e8f0fb" : d.statut === "Annulé" ? "#fff0f0" : "#f5f5f5",
                            color: d.statut === "Payé" ? "#fff" : d.statut === "Enregistré" ? "#1a5c9e" : d.statut === "Annulé" ? "#c0392b" : "#6b8aaa",
                            boxShadow: d.statut === "Payé" ? "0 3px 10px rgba(26,122,74,0.35)" : "none",
                            textTransform: "uppercase",
                          }}>
                            {d.statut === "Payé" ? "✅ Payé" : d.statut === "Annulé" ? "🚫 Annulé" : d.statut === "Enregistré" ? "📄 Enregistré" : "📝 " + d.statut}
                          </span>
                          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                            <button title="Aperçu" onClick={() => {
                              const num = "DEV-" + String(devisList.length - idx).padStart(4, "0") + "-" + new Date(d.created_at || d.date || Date.now()).getFullYear();
                              setPreviewDevis({ ...d, clientData: clients.find(c => c.nom === d.client), num });
                              setShowPreview(true);
                            }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.eye} size={14} stroke="#4a6d8c" /></button>
                            <button title="Dupliquer" onClick={() => dupliquerDevis(d)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>📋</button>
                            {(d.statut === "Brouillon" || d.statut === "Enregistré") && <button title="Modifier" onClick={() => {
                              setEditingDevisId(d.id);
                              setDevisClient(d.client);
                              setDevisDate(d.date || new Date().toISOString().split("T")[0]);
                              const lignes = (d.lignes || []).map(l => ({ nom: l.service || l.nom || "", groupe: l.groupe || "", tarif: l.tarif || l.prix || 0, unite: l.unite || "forfait", qty: l.qty || 1 }));
                              setDevisLines(lignes.length > 0 ? lignes : [{ nom: "", groupe: "", tarif: 0, unite: "forfait", qty: 1 }]);
                              window.scrollTo({ top: 0, behavior: "smooth" });
                            }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #c3e6cb", background: "#e8f5ee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✏️</button>}
                            {(d.statut === "Enregistré" || d.statut === "Envoyé") && <button title="Marquer Payé" onClick={() => marquerPaye(d.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #c3e6cb", background: "#e8f5ee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>✅</button>}
                            {d.statut !== "Annulé" && d.statut !== "Payé" && d.statut !== "Brouillon" && <button title="Annuler" onClick={() => marquerAnnule(d.id)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>🚫</button>}
                            {d.statut === "Payé" ? (
                              <div title="Devis payé — suppression impossible" style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2eaf4", background: "#f5f5f5", display: "flex", alignItems: "center", justifyContent: "center", cursor: "not-allowed", opacity: 0.35 }}>
                                <Icon d={ic.trash} size={13} stroke="#aaa" />
                              </div>
                            ) : (
                              <button title="Supprimer" onClick={() => { if(window.confirm("Supprimer ce devis ?")) db.delete("devis", d.id).then(loadAll); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon d={ic.trash} size={13} stroke="#c0392b" />
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })()}


            {/* ── RAPPORTS ── */}
            {page === "rapports" && (() => {
              const now = new Date();
              const annee = now.getFullYear();
              const moisNoms = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
              const catColors = { Fournitures: "#1a5c9e", Loyer: "#1a7a4a", Salaires: "#c17f2a", Transport: "#8e44ad", Informatique: "#c0392b", Communication: "#2980b9", Honoraires: "#e67e22", Autres: "#7f8c8d" };
              const freqMult = { "Mensuel": 1, "Trimestriel": 3, "Semestriel": 6, "Annuel": 12 };

              // ── Revenus (CA devis payés) ──
              const caMois = Array(12).fill(0);
              devisList.filter(d => d.statut === "Payé").forEach(d => {
                const dt = new Date(d.date || d.created_at);
                if (dt.getFullYear() === annee) caMois[dt.getMonth()] += d.total_ttc || 0;
              });
              const totalCA = caMois.reduce((s, v) => s + v, 0);
              const caAnneePrec = devisList.filter(d => d.statut === "Payé" && new Date(d.date || d.created_at).getFullYear() === annee - 1).reduce((s, d) => s + (d.total_ttc || 0), 0);

              // ── Dépenses ──
              const depMois = Array(12).fill(0);
              depenses.forEach(d => {
                const dt = new Date(d.date);
                if (dt.getFullYear() === annee) depMois[dt.getMonth()] += d.montant || 0;
              });
              const totalDep = depMois.reduce((s, v) => s + v, 0);
              const cats = {};
              depenses.forEach(d => {
                if (new Date(d.date).getFullYear() === annee) cats[d.categorie] = (cats[d.categorie] || 0) + (d.montant || 0);
              });

              // ── MRR / ARR ──
              const mrr = abonnements.filter(a => a.statut === "Actif").reduce((s, a) => s + (a.montant || 0) / (freqMult[a.frequence] || 1), 0);
              const arr = mrr * 12;

              // ── Résultat net ──
              const resultatNet = totalCA - totalDep;
              const margeRate = totalCA > 0 ? Math.round((resultatNet / totalCA) * 100) : 0;

              // ── Devis stats ──
              const devisPaies = devisList.filter(d => d.statut === "Payé").length;
              const devisTotal = devisList.length;
              const tauxConv = devisTotal > 0 ? Math.round((devisPaies / devisTotal) * 100) : 0;
              const panierMoyen = devisPaies > 0 ? Math.round(totalCA / devisPaies) : 0;
              const montantEnCours = devisList.filter(d => ["Enregistré","Envoyé"].includes(d.statut)).reduce((s, d) => s + (d.total_ttc || 0), 0);

              // ── Graphique combiné (CA vs Dépenses) ──
              const maxCombi = Math.max(...caMois, ...depMois, 1);

              // ── Mois le plus rentable ──
              const resultatsMois = caMois.map((ca, i) => ({ mois: moisNoms[i], net: ca - depMois[i], ca, dep: depMois[i] }));
              const meilleurMois = resultatsMois.reduce((best, m) => m.net > best.net ? m : best, resultatsMois[0]);

              // ── Clients par secteur ──
              const secteurs = {};
              clients.forEach(c => { secteurs[c.secteur || "Autre"] = (secteurs[c.secteur || "Autre"] || 0) + 1; });
              const maxS = Math.max(...Object.values(secteurs), 1);
              const sColors = ["#1a5c9e","#1a7a4a","#c17f2a","#8e44ad","#c0392b","#2980b9","#e67e22","#7f8c8d"];

              // ── Top clients CA ──
              const caParClient = {};
              devisList.filter(d => d.statut === "Payé").forEach(d => {
                caParClient[d.client] = (caParClient[d.client] || 0) + (d.total_ttc || 0);
              });
              const topClients = Object.entries(caParClient).sort((a, b) => b[1] - a[1]).slice(0, 5);
              const maxClientCA = topClients[0]?.[1] || 1;

              return (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                  {/* ── TITRE SECTION ── */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 10 }}>
                    <div>
                      <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a57" }}>Synthèse financière {annee}</div>
                      <div style={{ fontSize: 12, color: "#8da4c0", marginTop: 2 }}>Données en temps réel depuis Supabase</div>
                    </div>
                    <div style={{ fontSize: 11, background: "#e8f0fb", color: "#1a5c9e", fontWeight: 700, padding: "6px 14px", borderRadius: 20 }}>
                      Mis à jour : {now.toLocaleDateString("fr-FR")}
                    </div>
                  </div>

                  {/* ── KPIs PRINCIPAUX ── */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12 }}>
                    {[
                      { label: "CA encaissé", value: totalCA.toLocaleString("fr-FR") + " FCFA", delta: caAnneePrec > 0 ? `vs ${(caAnneePrec/1000).toFixed(0)}k FCFA en ${annee-1}` : `${devisPaies} devis payés`, color: "#1a7a4a", bg: "#e8f5ee", icon: ic.trend, emoji: "📈" },
                      { label: "Dépenses totales", value: totalDep.toLocaleString("fr-FR") + " FCFA", delta: `${Object.keys(cats).length} catégories`, color: "#c0392b", bg: "#fff0f0", icon: ic.depenses, emoji: "📉" },
                      { label: "Résultat net", value: (resultatNet >= 0 ? "+" : "") + resultatNet.toLocaleString("fr-FR") + " FCFA", delta: `Marge : ${margeRate}%`, color: resultatNet >= 0 ? "#1a7a4a" : "#c0392b", bg: resultatNet >= 0 ? "#e8f5ee" : "#fff0f0", icon: ic.rapports, emoji: resultatNet >= 0 ? "✅" : "⚠️" },
                      { label: "MRR récurrent", value: Math.round(mrr).toLocaleString("fr-FR") + " FCFA", delta: `ARR : ${Math.round(arr).toLocaleString("fr-FR")} FCFA`, color: "#8e44ad", bg: "#f5eefb", icon: ic.abonnement, emoji: "🔄" },
                    ].map((k, i) => (
                      <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 14, padding: isMobile ? "12px" : "16px 18px", boxShadow: "0 1px 4px rgba(0,30,80,.07)", borderTop: `3px solid ${k.color}`, display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: k.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16 }}>{k.emoji}</div>
                        </div>
                        <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, color: k.color, lineHeight: 1.2 }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: "#6b8aaa", fontWeight: 600 }}>{k.label}</div>
                        <div style={{ fontSize: 10, color: "#8da4c0" }}>{k.delta}</div>
                      </div>
                    ))}
                  </div>

                  {/* ── GRAPHIQUE CA vs DÉPENSES ── */}
                  <div className="card-hover" style={S.card}>
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <Icon d={ic.rapports} size={16} stroke="#1a5c9e" />
                        <span style={S.cardTitle}>CA encaissé vs Dépenses — {annee}</span>
                      </div>
                      <div style={{ display: "flex", gap: 12, fontSize: 11 }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#1a7a4a", display: "inline-block" }} />CA encaissé</span>
                        <span style={{ display: "flex", alignItems: "center", gap: 5 }}><span style={{ width: 10, height: 10, borderRadius: 2, background: "#c0392b", display: "inline-block" }} />Dépenses</span>
                      </div>
                    </div>
                    {(totalCA === 0 && totalDep === 0) ? <div style={S.empty}>Aucune donnée pour cette année</div> : (
                      <div style={{ display: "flex", alignItems: "flex-end", gap: isMobile ? 2 : 4, height: 140, padding: "0 4px" }}>
                        {caMois.map((ca, i) => {
                          const dep = depMois[i];
                          const hCA = maxCombi > 0 ? Math.max((ca / maxCombi) * 120, ca > 0 ? 4 : 0) : 0;
                          const hDep = maxCombi > 0 ? Math.max((dep / maxCombi) * 120, dep > 0 ? 4 : 0) : 0;
                          const isNow = i === now.getMonth();
                          return (
                            <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 3 }}>
                              <div style={{ width: "100%", display: "flex", alignItems: "flex-end", gap: 1, height: 120 }}>
                                <div title={`CA: ${ca.toLocaleString("fr-FR")} FCFA`} style={{ flex: 1, height: hCA, background: isNow ? "#1a7a4a" : "#a8d5b8", borderRadius: "2px 2px 0 0", transition: "height 0.5s ease", minHeight: 0 }} />
                                <div title={`Dép: ${dep.toLocaleString("fr-FR")} FCFA`} style={{ flex: 1, height: hDep, background: isNow ? "#c0392b" : "#f0b8b8", borderRadius: "2px 2px 0 0", transition: "height 0.5s ease", minHeight: 0 }} />
                              </div>
                              <span style={{ fontSize: 9, color: isNow ? "#1a5c9e" : "#8da4c0", fontWeight: isNow ? 700 : 400 }}>{moisNoms[i]}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* ── ROW : Compte de résultat + Dépenses par catégorie ── */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>

                    {/* Compte de résultat simplifié */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}>
                        <span style={{ fontSize: 16 }}>📊</span>
                        <span style={S.cardTitle}>Compte de résultat simplifié</span>
                        <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#e8f0fb", color: "#1a5c9e", padding: "3px 8px", borderRadius: 6 }}>{annee}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 0 }}>
                        {/* Produits */}
                        <div style={{ padding: "8px 12px", background: "#f5f8fc", borderRadius: 8, marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Produits</div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                            <span style={{ color: "#4a6d8c" }}>CA devis encaissés</span>
                            <span style={{ fontWeight: 700, color: "#1a7a4a" }}>+{totalCA.toLocaleString("fr-FR")} FCFA</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                            <span style={{ color: "#4a6d8c" }}>Revenus abonnements (MRR×12)</span>
                            <span style={{ fontWeight: 700, color: "#8e44ad" }}>+{Math.round(arr).toLocaleString("fr-FR")} FCFA</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 4 }}>
                            <span style={{ color: "#4a6d8c" }}>Devis en cours (pipeline)</span>
                            <span style={{ fontWeight: 600, color: "#c17f2a" }}>{montantEnCours.toLocaleString("fr-FR")} FCFA</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, borderTop: "1px solid #e2eaf4", paddingTop: 6, marginTop: 4 }}>
                            <span style={{ fontWeight: 700, color: "#1e3a57" }}>Total produits</span>
                            <span style={{ fontWeight: 800, color: "#1a7a4a" }}>+{(totalCA + Math.round(arr)).toLocaleString("fr-FR")} FCFA</span>
                          </div>
                        </div>
                        {/* Charges */}
                        <div style={{ padding: "8px 12px", background: "#fff9f9", borderRadius: 8, marginBottom: 8 }}>
                          <div style={{ fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 6 }}>Charges</div>
                          {Object.entries(cats).sort((a,b) => b[1]-a[1]).map(([cat, montant]) => (
                            <div key={cat} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                              <span style={{ color: "#4a6d8c" }}>{cat}</span>
                              <span style={{ fontWeight: 600, color: "#c0392b" }}>-{montant.toLocaleString("fr-FR")} FCFA</span>
                            </div>
                          ))}
                          {Object.keys(cats).length === 0 && <div style={{ fontSize: 12, color: "#8da4c0" }}>Aucune dépense enregistrée</div>}
                          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, borderTop: "1px solid #fde8e8", paddingTop: 6, marginTop: 4 }}>
                            <span style={{ fontWeight: 700, color: "#1e3a57" }}>Total charges</span>
                            <span style={{ fontWeight: 800, color: "#c0392b" }}>-{totalDep.toLocaleString("fr-FR")} FCFA</span>
                          </div>
                        </div>
                        {/* Résultat */}
                        <div style={{ padding: "12px 16px", borderRadius: 10, background: resultatNet >= 0 ? "linear-gradient(135deg,#e8f5ee,#f0faf4)" : "linear-gradient(135deg,#fff0f0,#fff5f5)", border: `2px solid ${resultatNet >= 0 ? "#1a7a4a" : "#c0392b"}` }}>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <div>
                              <div style={{ fontSize: 12, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", letterSpacing: 0.5 }}>Résultat net</div>
                              <div style={{ fontSize: 11, color: "#8da4c0", marginTop: 2 }}>Marge nette : {margeRate}%</div>
                            </div>
                            <div style={{ fontSize: 22, fontWeight: 900, color: resultatNet >= 0 ? "#1a7a4a" : "#c0392b" }}>
                              {resultatNet >= 0 ? "+" : ""}{resultatNet.toLocaleString("fr-FR")} FCFA
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Dépenses par catégorie + KPIs devis */}
                    <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                      <div className="card-hover" style={S.card}>
                        <div style={S.cardHeader}><Icon d={ic.trend} size={16} stroke="#c17f2a" /><span style={S.cardTitle}>Dépenses par catégorie</span></div>
                        {Object.keys(cats).length === 0 ? <div style={S.empty}>Aucune dépense cette année</div> : (
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {Object.entries(cats).sort((a,b) => b[1]-a[1]).map(([cat, montant]) => (
                              <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                                <div style={{ width: 8, height: 8, borderRadius: "50%", background: catColors[cat] || "#888", flexShrink: 0 }} />
                                <div style={{ width: 90, fontSize: 11, color: "#4a6d8c", flexShrink: 0 }}>{cat}</div>
                                <div style={{ flex: 1, height: 7, background: "#f0f4fa", borderRadius: 4, overflow: "hidden" }}>
                                  <div style={{ width: `${totalDep ? (montant/totalDep*100) : 0}%`, height: "100%", background: catColors[cat] || "#888", borderRadius: 4 }} />
                                </div>
                                <div style={{ width: 40, fontSize: 10, color: "#8da4c0", textAlign: "right" }}>{totalDep ? Math.round(montant/totalDep*100) : 0}%</div>
                                <div style={{ width: 100, fontSize: 11, fontWeight: 700, color: "#1e3a57", textAlign: "right" }}>{montant.toLocaleString("fr-FR")} FCFA</div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* KPIs devis */}
                      <div className="card-hover" style={S.card}>
                        <div style={S.cardHeader}><Icon d={ic.devis} size={16} stroke="#1a5c9e" /><span style={S.cardTitle}>Performance commerciale</span></div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          {[
                            { label: "Taux de conversion", value: tauxConv + "%", color: tauxConv >= 50 ? "#1a7a4a" : "#c17f2a", bg: tauxConv >= 50 ? "#e8f5ee" : "#fff8e6" },
                            { label: "Panier moyen", value: panierMoyen > 0 ? (panierMoyen/1000).toFixed(0) + "k FCFA" : "—", color: "#1a5c9e", bg: "#e8f0fb" },
                            { label: "Devis en cours", value: devisList.filter(d => ["Enregistré","Envoyé"].includes(d.statut)).length, color: "#c17f2a", bg: "#fff8e6" },
                            { label: "Meilleur mois", value: meilleurMois?.net > 0 ? meilleurMois.mois : "—", color: "#1a7a4a", bg: "#e8f5ee" },
                          ].map((item, i) => (
                            <div key={i} style={{ padding: "10px 12px", borderRadius: 9, background: item.bg, display: "flex", flexDirection: "column", gap: 3 }}>
                              <div style={{ fontSize: 16, fontWeight: 800, color: item.color }}>{item.value}</div>
                              <div style={{ fontSize: 10, color: "#6b8aaa", fontWeight: 500 }}>{item.label}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* ── ROW : Top clients + Clients par secteur ── */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>

                    {/* Top clients par CA */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}><Icon d={ic.clients} size={16} stroke="#8e44ad" /><span style={S.cardTitle}>Top clients par CA encaissé</span></div>
                      {topClients.length === 0 ? <div style={S.empty}>Aucun devis payé pour l'instant</div> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {topClients.map(([nom, ca], i) => (
                            <div key={nom} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 24, height: 24, borderRadius: "50%", background: ["linear-gradient(135deg,#f6c90e,#e8a400)","#e8e8e8","#cd7f32","#e8f0fb","#f5eefb"][i] || "#e8f0fb", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 800, color: i === 0 ? "#7a5000" : "#6b8aaa", flexShrink: 0 }}>
                                {i + 1}
                              </div>
                              <div style={{ flex: 1 }}>
                                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                                  <span style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{nom}</span>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: "#1a5c9e" }}>{ca.toLocaleString("fr-FR")} FCFA</span>
                                </div>
                                <div style={{ height: 5, background: "#f0f4fa", borderRadius: 3, overflow: "hidden" }}>
                                  <div style={{ width: `${(ca / maxClientCA) * 100}%`, height: "100%", background: i === 0 ? "linear-gradient(90deg,#f6c90e,#e8a400)" : "#c8ddf5", borderRadius: 3 }} />
                                </div>
                              </div>
                              <div style={{ fontSize: 10, color: "#8da4c0", flexShrink: 0 }}>{totalCA > 0 ? Math.round(ca/totalCA*100) : 0}%</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Clients par secteur */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}><Icon d={ic.clients} size={16} stroke="#1a7a4a" /><span style={S.cardTitle}>Clients par secteur</span></div>
                      {clients.length === 0 ? <div style={S.empty}>Aucun client enregistré</div> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {Object.entries(secteurs).sort((a,b) => b[1]-a[1]).map(([s, n], i) => (
                            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 8, height: 8, borderRadius: "50%", background: sColors[i % sColors.length], flexShrink: 0 }} />
                              <div style={{ width: 90, fontSize: 12, color: "#4a6d8c", flexShrink: 0 }}>{s}</div>
                              <div style={{ flex: 1, height: 7, background: "#f0f4fa", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${(n/maxS)*100}%`, height: "100%", background: sColors[i % sColors.length], borderRadius: 4 }} />
                              </div>
                              <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: "#1e3a57", textAlign: "right" }}>{n}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* ── ANALYSE TRIMESTRIELLE ── */}
                  {(() => {
                    const trimestres = ["T1 (Jan-Mar)", "T2 (Avr-Jun)", "T3 (Jul-Sep)", "T4 (Oct-Déc)"];
                    const trimData = trimestres.map((label, t) => {
                      const moisStart = t * 3;
                      const ca = caMois.slice(moisStart, moisStart + 3).reduce((s, v) => s + v, 0);
                      const dep = depMois.slice(moisStart, moisStart + 3).reduce((s, v) => s + v, 0);
                      const net = ca - dep;
                      const marge = ca > 0 ? Math.round((net / ca) * 100) : 0;
                      const isCurrent = now.getMonth() >= moisStart && now.getMonth() < moisStart + 3;
                      return { label, ca, dep, net, marge, isCurrent };
                    });
                    const maxTrimCA = Math.max(...trimData.map(t => t.ca), 1);
                    return (
                      <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                        {/* Graphique trimestriel */}
                        <div className="card-hover" style={S.card}>
                          <div style={S.cardHeader}>
                            <span style={{ fontSize: 16 }}>📆</span>
                            <span style={S.cardTitle}>Analyse trimestrielle — {annee}</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                            {trimData.map((t, i) => (
                              <div key={i} style={{ padding: "12px 14px", borderRadius: 10, background: t.isCurrent ? "#f0f6ff" : "#f5f8fc", border: t.isCurrent ? "1px solid #1a5c9e30" : "1px solid transparent" }}>
                                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                                  <span style={{ fontSize: 12, fontWeight: 700, color: t.isCurrent ? "#1a5c9e" : "#4a6d8c" }}>
                                    {t.label} {t.isCurrent && <span style={{ fontSize: 9, background: "#1a5c9e", color: "#fff", padding: "1px 5px", borderRadius: 4, marginLeft: 4 }}>EN COURS</span>}
                                  </span>
                                  <span style={{ fontSize: 13, fontWeight: 800, color: t.net >= 0 ? "#1a7a4a" : "#c0392b" }}>
                                    {t.net >= 0 ? "+" : ""}{t.net.toLocaleString("fr-FR")} FCFA
                                  </span>
                                </div>
                                <div style={{ display: "flex", gap: 8, marginBottom: 6 }}>
                                  <div style={{ flex: 1, height: 6, background: "#f0f4fa", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${maxTrimCA > 0 ? (t.ca / maxTrimCA) * 100 : 0}%`, height: "100%", background: "#1a7a4a", borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: 10, color: "#1a7a4a", fontWeight: 600, whiteSpace: "nowrap" }}>{t.ca > 0 ? (t.ca/1000).toFixed(0)+"k" : "—"} CA</span>
                                </div>
                                <div style={{ display: "flex", gap: 8 }}>
                                  <div style={{ flex: 1, height: 6, background: "#f0f4fa", borderRadius: 3, overflow: "hidden" }}>
                                    <div style={{ width: `${maxTrimCA > 0 ? (t.dep / maxTrimCA) * 100 : 0}%`, height: "100%", background: "#c0392b", borderRadius: 3 }} />
                                  </div>
                                  <span style={{ fontSize: 10, color: "#c0392b", fontWeight: 600, whiteSpace: "nowrap" }}>{t.dep > 0 ? (t.dep/1000).toFixed(0)+"k" : "—"} Dép</span>
                                </div>
                                {t.ca > 0 && (
                                  <div style={{ marginTop: 6, fontSize: 10, color: "#8da4c0" }}>
                                    Marge : <span style={{ fontWeight: 700, color: t.marge >= 50 ? "#1a7a4a" : t.marge >= 0 ? "#c17f2a" : "#c0392b" }}>{t.marge}%</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Prévisionnel MRR */}
                        <div className="card-hover" style={S.card}>
                          <div style={S.cardHeader}>
                            <span style={{ fontSize: 16 }}>🔮</span>
                            <span style={S.cardTitle}>Prévisionnel revenus récurrents</span>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                            {/* MRR actuel */}
                            <div style={{ padding: "14px 16px", borderRadius: 10, background: "linear-gradient(135deg,#f5eefb,#ede0fa)", border: "1px solid #d7b8f5" }}>
                              <div style={{ fontSize: 11, color: "#8e44ad", fontWeight: 700, textTransform: "uppercase", letterSpacing: 0.5 }}>MRR actuel</div>
                              <div style={{ fontSize: 28, fontWeight: 900, color: "#8e44ad", marginTop: 4 }}>{Math.round(mrr).toLocaleString("fr-FR")} FCFA</div>
                              <div style={{ fontSize: 11, color: "#8da4c0", marginTop: 2 }}>{abonnements.filter(a => a.statut === "Actif").length} abonnés actifs</div>
                            </div>
                            {/* Projections */}
                            {[
                              { label: "Projection 3 mois", mult: 3, color: "#1a5c9e", bg: "#e8f0fb" },
                              { label: "Projection 6 mois", mult: 6, color: "#1a7a4a", bg: "#e8f5ee" },
                              { label: "ARR (12 mois)", mult: 12, color: "#c17f2a", bg: "#fff8e6" },
                            ].map((p, i) => (
                              <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", borderRadius: 9, background: p.bg }}>
                                <span style={{ fontSize: 12, color: "#4a6d8c", fontWeight: 500 }}>{p.label}</span>
                                <span style={{ fontSize: 14, fontWeight: 800, color: p.color }}>{Math.round(mrr * p.mult).toLocaleString("fr-FR")} FCFA</span>
                              </div>
                            ))}
                            {/* Répartition par fréquence */}
                            {abonnements.filter(a => a.statut === "Actif").length > 0 && (
                              <div style={{ marginTop: 4 }}>
                                <div style={{ fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Répartition des abonnés</div>
                                {["Mensuel","Trimestriel","Semestriel","Annuel"].map(freq => {
                                  const items = abonnements.filter(a => a.statut === "Actif" && a.frequence === freq);
                                  if (!items.length) return null;
                                  const mrrFreq = items.reduce((s, a) => s + (a.montant||0) / (freqMult[freq]||1), 0);
                                  return (
                                    <div key={freq} style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                                      <span style={{ fontSize: 11, color: "#4a6d8c", width: 90, flexShrink: 0 }}>{freq} ({items.length})</span>
                                      <div style={{ flex: 1, height: 5, background: "#f0f4fa", borderRadius: 3, overflow: "hidden" }}>
                                        <div style={{ width: mrr > 0 ? (mrrFreq/mrr*100)+"%" : "0%", height: "100%", background: "linear-gradient(90deg,#8e44ad,#b44dcc)", borderRadius: 3 }} />
                                      </div>
                                      <span style={{ fontSize: 11, fontWeight: 700, color: "#8e44ad", whiteSpace: "nowrap" }}>{Math.round(mrrFreq).toLocaleString("fr-FR")} FCFA</span>
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })()}

                  {/* ── RÉSULTATS MENSUELS ── */}
                  <div className="card-hover" style={S.card}>
                    <div style={S.cardHeader}>
                      <span style={{ fontSize: 16 }}>📅</span>
                      <span style={S.cardTitle}>Résultats mensuels détaillés — {annee}</span>
                      <button onClick={() => {
                        const rows = resultatsMois.map(m => {
                          const marge = m.ca > 0 ? Math.round((m.net / m.ca) * 100) : 0;
                          return `${m.mois}\t${m.ca}\t${m.dep}\t${m.net}\t${marge}%`;
                        });
                        const csv = "Mois\tCA (FCFA)\tDépenses (FCFA)\tRésultat (FCFA)\tMarge\n" + rows.join("\n") + `\nTOTAL\t${totalCA}\t${totalDep}\t${resultatNet}\t${margeRate}%`;
                        const blob = new Blob([csv], { type: "text/tab-separated-values" });
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement("a"); a.href = url; a.download = `synthese_financiere_${annee}.tsv`; a.click();
                        URL.revokeObjectURL(url);
                      }} style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", borderRadius: 8, background: "#e8f0fb", color: "#1a5c9e", border: "none", cursor: "pointer", fontSize: 11, fontWeight: 700 }}>
                        ⬇ Exporter
                      </button>
                    </div>
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#f5f8fc" }}>
                            {["Mois", "CA encaissé", "Dépenses", "Résultat", "Marge"].map(h => (
                              <th key={h} style={{ padding: "8px 12px", textAlign: h === "Mois" ? "left" : "right", fontSize: 10, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", letterSpacing: 0.5, whiteSpace: "nowrap" }}>{h}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {resultatsMois.map((m, i) => {
                            const marge = m.ca > 0 ? Math.round((m.net / m.ca) * 100) : 0;
                            const isCurrent = i === now.getMonth();
                            const hasData = m.ca > 0 || m.dep > 0;
                            return (
                              <tr key={i} style={{ background: isCurrent ? "#f0f6ff" : "transparent", borderBottom: "1px solid #f0f4fa" }}>
                                <td style={{ padding: "9px 12px", fontWeight: isCurrent ? 700 : 500, color: isCurrent ? "#1a5c9e" : "#4a6d8c" }}>
                                  {m.mois} {isCurrent && <span style={{ fontSize: 9, background: "#1a5c9e", color: "#fff", padding: "1px 5px", borderRadius: 4, marginLeft: 4 }}>EN COURS</span>}
                                </td>
                                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 700, color: hasData ? "#1a7a4a" : "#c8d8e8" }}>{m.ca > 0 ? m.ca.toLocaleString("fr-FR") + " FCFA" : "—"}</td>
                                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 600, color: hasData ? "#c0392b" : "#c8d8e8" }}>{m.dep > 0 ? m.dep.toLocaleString("fr-FR") + " FCFA" : "—"}</td>
                                <td style={{ padding: "9px 12px", textAlign: "right", fontWeight: 800, color: !hasData ? "#c8d8e8" : m.net >= 0 ? "#1a7a4a" : "#c0392b" }}>
                                  {hasData ? (m.net >= 0 ? "+" : "") + m.net.toLocaleString("fr-FR") + " FCFA" : "—"}
                                </td>
                                <td style={{ padding: "9px 12px", textAlign: "right" }}>
                                  {hasData && m.ca > 0 ? (
                                    <span style={{ fontSize: 11, fontWeight: 700, padding: "2px 7px", borderRadius: 6, background: marge >= 50 ? "#e8f5ee" : marge >= 0 ? "#fff8e6" : "#fff0f0", color: marge >= 50 ? "#1a7a4a" : marge >= 0 ? "#c17f2a" : "#c0392b" }}>
                                      {marge}%
                                    </span>
                                  ) : <span style={{ color: "#c8d8e8" }}>—</span>}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                        <tfoot>
                          <tr style={{ background: "#f0f4fa", borderTop: "2px solid #e2eaf4" }}>
                            <td style={{ padding: "10px 12px", fontWeight: 800, color: "#1e3a57", fontSize: 13 }}>TOTAL</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#1a7a4a", fontSize: 13 }}>{totalCA > 0 ? totalCA.toLocaleString("fr-FR") + " FCFA" : "—"}</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 800, color: "#c0392b", fontSize: 13 }}>{totalDep > 0 ? totalDep.toLocaleString("fr-FR") + " FCFA" : "—"}</td>
                            <td style={{ padding: "10px 12px", textAlign: "right", fontWeight: 900, color: resultatNet >= 0 ? "#1a7a4a" : "#c0392b", fontSize: 14 }}>
                              {(resultatNet >= 0 ? "+" : "") + resultatNet.toLocaleString("fr-FR")} FCFA
                            </td>
                            <td style={{ padding: "10px 12px", textAlign: "right" }}>
                              <span style={{ fontSize: 12, fontWeight: 800, padding: "3px 8px", borderRadius: 6, background: margeRate >= 50 ? "#e8f5ee" : margeRate >= 0 ? "#fff8e6" : "#fff0f0", color: margeRate >= 50 ? "#1a7a4a" : margeRate >= 0 ? "#c17f2a" : "#c0392b" }}>
                                {margeRate}%
                              </span>
                            </td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>

                </div>
              );
            })()}

            {/* ── COLLABORATEURS ── */}
            {/* Modal accès collaborateur — hors IIFE */}
            {/* MODAL PERMISSIONS */}
            {showPermissions && permCollab && (() => {
              const modules = [
                { id: "dashboard", label: "📊 Dashboard" },
                { id: "clients", label: "👥 Clients" },
                { id: "abonnements", label: "🔄 Abonnements" },
                { id: "devis", label: "📄 Devis" },
                { id: "services", label: "🛠 Services" },
                { id: "depenses", label: "💸 Dépenses" },
                { id: "rapports", label: "📈 Rapports" },
                { id: "collab", label: "👤 Collaborateurs" },
                { id: "documents", label: "📁 Documents" },
                { id: "settings", label: "⚙️ Paramètres" },
              ];
              const actions = ["voir", "ajouter", "modifier", "supprimer"];
              const actionLabels = { voir: "Voir", ajouter: "Ajouter", modifier: "Modifier", supprimer: "Supprimer" };

              const getPerm = (moduleId, action) => {
                return permCollab.permissions?.[moduleId]?.[action] || false;
              };

              const togglePerm = (moduleId, action) => {
                const current = getPerm(moduleId, action);
                setPermCollab(p => ({
                  ...p,
                  permissions: {
                    ...p.permissions,
                    [moduleId]: {
                      ...(p.permissions?.[moduleId] || {}),
                      [action]: !current
                    }
                  }
                }));
              };

              const toggleAll = (moduleId) => {
                const allChecked = actions.every(a => getPerm(moduleId, a));
                setPermCollab(p => ({
                  ...p,
                  permissions: {
                    ...p.permissions,
                    [moduleId]: Object.fromEntries(actions.map(a => [a, !allChecked]))
                  }
                }));
              };

              return (
                <div style={{ position: "fixed", inset: 0, background: "rgba(10,30,60,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                  <div style={{ background: "#fff", borderRadius: 16, padding: 24, width: "100%", maxWidth: 600, boxShadow: "0 8px 40px rgba(0,30,80,.18)", maxHeight: "90vh", overflowY: "auto" }}>
                    {/* Header */}
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                      <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#1a5c9e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15 }}>
                        {permCollab.nom?.[0]?.toUpperCase()}
                      </div>
                      <div>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3a57" }}>Permissions — {permCollab.nom}</div>
                        <div style={{ fontSize: 11, color: "#8da4c0" }}>Définissez les droits d'accès de ce collaborateur</div>
                      </div>
                    </div>

                    {/* Tableau permissions */}
                    <div style={{ overflowX: "auto" }}>
                      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                        <thead>
                          <tr style={{ background: "#f5f8fc" }}>
                            <th style={{ padding: "10px 12px", textAlign: "left", color: "#4a6d8c", fontWeight: 700, borderBottom: "2px solid #e2eaf4" }}>Module</th>
                            {actions.map(a => (
                              <th key={a} style={{ padding: "10px 12px", textAlign: "center", color: "#4a6d8c", fontWeight: 700, borderBottom: "2px solid #e2eaf4" }}>{actionLabels[a]}</th>
                            ))}
                            <th style={{ padding: "10px 12px", textAlign: "center", color: "#4a6d8c", fontWeight: 700, borderBottom: "2px solid #e2eaf4" }}>Tout</th>
                          </tr>
                        </thead>
                        <tbody>
                          {modules.map((mod, i) => (
                            <tr key={mod.id} style={{ background: i % 2 === 0 ? "#fff" : "#fafbfd", borderBottom: "1px solid #f0f4fa" }}>
                              <td style={{ padding: "10px 12px", fontWeight: 600, color: "#1e3a57" }}>{mod.label}</td>
                              {actions.map(action => (
                                <td key={action} style={{ padding: "10px 12px", textAlign: "center" }}>
                                  <input type="checkbox"
                                    checked={getPerm(mod.id, action)}
                                    onChange={() => togglePerm(mod.id, action)}
                                    style={{ width: 16, height: 16, accentColor: "#1a5c9e", cursor: "pointer" }}
                                  />
                                </td>
                              ))}
                              <td style={{ padding: "10px 12px", textAlign: "center" }}>
                                <input type="checkbox"
                                  checked={actions.every(a => getPerm(mod.id, a))}
                                  onChange={() => toggleAll(mod.id)}
                                  style={{ width: 16, height: 16, accentColor: "#8e44ad", cursor: "pointer" }}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {/* Boutons */}
                    <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                      <button onClick={() => { setShowPermissions(false); setPermCollab(null); }}
                        style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>
                        Annuler
                      </button>
                      <button onClick={savePermissions} disabled={permSaving}
                        style={{ ...S.primaryBtn, opacity: permSaving ? 0.7 : 1 }}>
                        {permSaving ? "Enregistrement..." : "💾 Enregistrer"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })()}

            {showAccesCollab && accesCollab && (
              <div style={{ position: "fixed", inset: 0, background: "rgba(10,30,60,.45)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
                <div style={{ background: "#fff", borderRadius: 16, padding: 28, width: "100%", maxWidth: 420, boxShadow: "0 8px 40px rgba(0,30,80,.18)" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <div style={{ width: 42, height: 42, borderRadius: "50%", background: "#1a5c9e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>
                      {accesCollab.nom?.[0]?.toUpperCase() || "?"}
                    </div>
                    <div>
                      <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3a57" }}>Créer un accès</div>
                      <div style={{ fontSize: 12, color: "#6b8aaa" }}>{accesCollab.nom}</div>
                    </div>
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Email de connexion *</label>
                    <input type="email" value={accesEmail} onChange={e => setAccesEmail(e.target.value)}
                      placeholder={accesCollab.email || "email@cabinet.fr"} style={S.input} />
                  </div>
                  <div style={S.formGroup}>
                    <label style={S.label}>Mot de passe *</label>
                    <div style={{ position: "relative" }}>
                      <input type={accesShowPass ? "text" : "password"} value={accesPassword}
                        onChange={e => setAccesPassword(e.target.value)}
                        placeholder="6 caractères minimum"
                        style={{ ...S.input, paddingRight: 40 }} />
                      <button onClick={() => setAccesShowPass(!accesShowPass)}
                        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", fontSize: 14 }}>
                        {accesShowPass ? "🙈" : "👁️"}
                      </button>
                    </div>
                    <div style={{ fontSize: 11, color: "#8da4c0", marginTop: 4 }}>Minimum 6 caractères</div>
                  </div>
                  {accesMsg && (
                    <div style={{ padding: "10px 14px", borderRadius: 9, background: accesMsg.type === "success" ? "#e8f5ee" : "#fff0f0", border: `1px solid ${accesMsg.type === "success" ? "#1a7a4a44" : "#fcc"}`, color: accesMsg.type === "success" ? "#1a7a4a" : "#c0392b", fontSize: 13, marginBottom: 14 }}>
                      {accesMsg.text}
                    </div>
                  )}
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                    <button onClick={() => { setShowAccesCollab(false); setAccesEmail(""); setAccesPassword(""); setAccesMsg(null); }}
                      style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>
                      Annuler
                    </button>
                    <button onClick={createAcces} disabled={acesSaving}
                      style={{ ...S.primaryBtn, opacity: acesSaving ? 0.7 : 1 }}>
                      {acesSaving ? "Création..." : "🔑 Créer l'accès"}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {page === "collab" && (() => {
              const statutColors = {
                "Associé":  { bg: "#e8f0fb", color: "#1a5c9e" },
                "CDI":      { bg: "#e8f5ee", color: "#1a7a4a" },
                "CDD":      { bg: "#fff8e6", color: "#c17f2a" },
                "Stage":    { bg: "#f5eefb", color: "#8e44ad" },
                "Freelance":{ bg: "#fff0f0", color: "#c0392b" },
              };
              const avatarColors = ["#1a5c9e","#1a7a4a","#c17f2a","#8e44ad","#c0392b","#2980b9","#e67e22"];
              const getInitials = (nom) => nom.split(" ").map(w => w[0]).slice(0,2).join("").toUpperCase();

              const saveCollab = async () => {
                if (!newCollab.nom.trim()) return;
                setCollabSaving(true);
                await db.post("collaborateurs", newCollab);
                setShowAddCollab(false);
                setNewCollab({ nom: "", role: "", email: "", telephone: "", statut: "CDI", dossiers: 0, note: "" });
                setCollabSaving(false);
                loadAll();
              };

              const updateCollab = async () => {
                if (!editCollab?.nom?.trim()) return;
                setCollabSaving(true);
                await db.patch("collaborateurs", editCollab.id, editCollab);
                setShowEditCollab(false);
                setEditCollab(null);
                setCollabSaving(false);
                loadAll();
              };

              const deleteCollab = async (id) => {
                if (!window.confirm("Supprimer ce collaborateur ?")) return;
                await db.delete("collaborateurs", id);
                loadAll();
              };


              return (
                <div>
                  {/* Modal ajout — même style que formulaire client */}
                  {showAddCollab && (
                    <Modal title="Nouveau collaborateur" onClose={() => setShowAddCollab(false)}>
                      {[
                        { label: "Nom complet *", key: "nom", type: "text", placeholder: "Ex: Jean Dupont" },
                        { label: "Rôle / Poste", key: "role", type: "text", placeholder: "Ex: Expert-comptable" },
                        { label: "Email", key: "email", type: "email", placeholder: "jean.dupont@cabinet.fr" },
                        { label: "Téléphone", key: "telephone", type: "tel", placeholder: "+237 6XX XXX XXX" },
                        { label: "Dossiers assignés", key: "dossiers", type: "number", placeholder: "0" },
                      ].map(field => (
                        <div key={field.key} style={S.formGroup}>
                          <label style={S.label}>{field.label}</label>
                          <input
                            type={field.type}
                            value={newCollab[field.key] || ""}
                            onChange={e => setNewCollab(p => ({ ...p, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                            placeholder={field.placeholder}
                            style={S.input}
                          />
                        </div>
                      ))}
                      <div style={S.formGroup}>
                        <label style={S.label}>Statut</label>
                        <select value={newCollab.statut || "CDI"} onChange={e => setNewCollab(p => ({ ...p, statut: e.target.value }))} style={S.select}>
                          {["Associé","CDI","CDD","Stage","Freelance"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={S.formGroup}>
                        <label style={S.label}>Note</label>
                        <textarea
                          value={newCollab.note || ""}
                          onChange={e => setNewCollab(p => ({ ...p, note: e.target.value }))}
                          placeholder="Informations complémentaires..."
                          rows={2}
                          style={{ ...S.input, resize: "vertical" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                        <button onClick={() => setShowAddCollab(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
                        <button onClick={saveCollab} disabled={collabSaving} style={{ ...S.primaryBtn, opacity: collabSaving ? 0.7 : 1 }}>{collabSaving ? "Enregistrement..." : "Enregistrer"}</button>
                      </div>
                    </Modal>
                  )}
                  {/* Modal édition — même style que formulaire client */}
                  {showEditCollab && editCollab && (
                    <Modal title="Modifier le collaborateur" onClose={() => { setShowEditCollab(false); setEditCollab(null); }}>
                      {[
                        { label: "Nom complet *", key: "nom", type: "text", placeholder: "Ex: Jean Dupont" },
                        { label: "Rôle / Poste", key: "role", type: "text", placeholder: "Ex: Expert-comptable" },
                        { label: "Email", key: "email", type: "email", placeholder: "jean.dupont@cabinet.fr" },
                        { label: "Téléphone", key: "telephone", type: "tel", placeholder: "+237 6XX XXX XXX" },
                        { label: "Dossiers assignés", key: "dossiers", type: "number", placeholder: "0" },
                      ].map(field => (
                        <div key={field.key} style={S.formGroup}>
                          <label style={S.label}>{field.label}</label>
                          <input
                            type={field.type}
                            value={editCollab[field.key] || ""}
                            onChange={e => setEditCollab(p => ({ ...p, [field.key]: field.type === "number" ? Number(e.target.value) : e.target.value }))}
                            placeholder={field.placeholder}
                            style={S.input}
                          />
                        </div>
                      ))}
                      <div style={S.formGroup}>
                        <label style={S.label}>Statut</label>
                        <select value={editCollab.statut || "CDI"} onChange={e => setEditCollab(p => ({ ...p, statut: e.target.value }))} style={S.select}>
                          {["Associé","CDI","CDD","Stage","Freelance"].map(s => <option key={s}>{s}</option>)}
                        </select>
                      </div>
                      <div style={S.formGroup}>
                        <label style={S.label}>Note</label>
                        <textarea
                          value={editCollab.note || ""}
                          onChange={e => setEditCollab(p => ({ ...p, note: e.target.value }))}
                          placeholder="Informations complémentaires..."
                          rows={2}
                          style={{ ...S.input, resize: "vertical" }}
                        />
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
                        <button onClick={() => { setShowEditCollab(false); setEditCollab(null); }} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
                        <button onClick={updateCollab} disabled={collabSaving} style={{ ...S.primaryBtn, opacity: collabSaving ? 0.7 : 1 }}>{collabSaving ? "Enregistrement..." : "Enregistrer"}</button>
                      </div>
                    </Modal>
                  )}

                  {/* KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Total", value: collaborateurs.length, color: "#1a5c9e", bg: "#e8f0fb", emoji: "👥" },
                      { label: "CDI / Associés", value: collaborateurs.filter(c => ["CDI","Associé"].includes(c.statut)).length, color: "#1a7a4a", bg: "#e8f5ee", emoji: "📋" },
                      { label: "Stagiaires", value: collaborateurs.filter(c => c.statut === "Stage").length, color: "#8e44ad", bg: "#f5eefb", emoji: "🎓" },
                      { label: "Dossiers assignés", value: collaborateurs.reduce((s, c) => s + (Number(c.dossiers) || 0), 0), color: "#c17f2a", bg: "#fff8e6", emoji: "📁" },
                    ].map((k, i) => (
                      <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: isMobile ? "12px" : "14px 16px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", borderTop: "3px solid " + k.color }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{k.emoji}</div>
                        <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: "#6b8aaa", fontWeight: 600 }}>{k.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Toolbar */}
                  <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                    {canDo("collab","ajouter") && <button onClick={() => { setNewCollab({ nom: "", role: "", email: "", telephone: "", statut: "CDI", dossiers: 0, note: "" }); setShowAddCollab(true); }} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Ajouter un collaborateur</button>}
                  </div>

                  {/* Grille collaborateurs */}
                  {collaborateurs.length === 0 ? (
                    <div className="card-hover" style={{ ...S.card, textAlign: "center", padding: 40 }}>
                      <div style={{ fontSize: 40, marginBottom: 12 }}>👥</div>
                      <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a57", marginBottom: 6 }}>Aucun collaborateur enregistré</div>
                      <div style={{ fontSize: 13, color: "#8da4c0", marginBottom: 16 }}>Ajoutez votre équipe pour commencer</div>
                      <button onClick={() => setShowAddCollab(true)} style={S.primaryBtn}>+ Ajouter le premier</button>
                    </div>
                  ) : (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
                      {collaborateurs.map((c, i) => {
                        const sc = statutColors[c.statut] || statutColors["CDI"];
                        const avatarColor = avatarColors[i % avatarColors.length];
                        return (
                          <div key={c.id} className="card-hover" style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12, position: "relative" }}>
                            {/* Actions */}
                            <div style={{ position: "absolute", top: 12, right: 12, display: "flex", gap: 6 }}>
                              <button onClick={() => { setPermCollab({ ...c, permissions: c.permissions || {} }); setShowPermissions(true); }}
                                title="Gérer les permissions" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #d4ecd4", background: "#f0faf0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                                🔒
                              </button>
                              <button onClick={() => { setAccesCollab(c); setAccesEmail(c.email || ""); setAccesPassword(""); setAccesMsg(null); setShowAccesCollab(true); }}
                                title="Créer un accès" style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #d4ecd4", background: "#f0faf0", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 13 }}>
                                🔑
                              </button>
                              <button onClick={() => { setEditCollab({ ...c }); setShowEditCollab(true); }}
                                style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <Icon d={ic.edit} size={12} stroke="#4a6d8c" />
                              </button>
                              {canDo("collab","supprimer") && <button onClick={() => deleteCollab(c.id)} style={{ width: 28, height: 28, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={12} stroke="#c0392b" /></button>}
                            </div>
                            {/* Avatar + infos */}
                            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 46, height: 46, borderRadius: "50%", background: avatarColor, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>
                                {getInitials(c.nom)}
                              </div>
                              <div style={{ paddingRight: 60 }}>
                                <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a57" }}>{c.nom}</div>
                                <div style={{ fontSize: 12, color: "#6b8aaa" }}>{c.role || "—"}</div>
                              </div>
                            </div>
                            {/* Contact */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                              {c.email && <div style={{ fontSize: 12, color: "#8da4c0", display: "flex", alignItems: "center", gap: 6 }}>📧 {c.email}</div>}
                              {c.telephone && <div style={{ fontSize: 12, color: "#8da4c0", display: "flex", alignItems: "center", gap: 6 }}>📞 {c.telephone}</div>}
                            </div>
                            {/* Note */}
                            {c.note && <div style={{ fontSize: 11, color: "#8da4c0", fontStyle: "italic", background: "#f5f8fc", borderRadius: 6, padding: "6px 10px" }}>{c.note}</div>}
                            {/* Footer */}
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto" }}>
                              <span style={{ fontSize: 12, color: "#4a6d8c" }}>
                                <b style={{ color: "#1e3a57" }}>{c.dossiers || 0}</b> dossier{c.dossiers !== 1 ? "s" : ""}
                              </span>
                              <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: sc.bg, color: sc.color }}>{c.statut}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })()}

            {/* ── DOCUMENTS ── */}
            {page === "documents" && (() => {
              const categories = ["Tous", "Bilan", "Contrat", "Liasse", "Courrier", "Rapport", "Autre"];
              const extColor = (nom) => {
                const ext = nom?.split(".").pop()?.toLowerCase();
                if (ext === "pdf") return "#c0392b";
                if (["xlsx","xls","csv"].includes(ext)) return "#1a7a4a";
                if (["docx","doc"].includes(ext)) return "#1a5c9e";
                return "#8e44ad";
              };
              const formatSize = (bytes) => {
                if (!bytes) return "—";
                if (bytes < 1024) return bytes + " o";
                if (bytes < 1024*1024) return (bytes/1024).toFixed(0) + " Ko";
                return (bytes/(1024*1024)).toFixed(1) + " Mo";
              };

              const uploadDoc = async (file) => {
                if (!file) return;
                setDocUploading(true);
                try {
                  // 1. Upload dans Supabase Storage
                  const fileName = `${Date.now()}_${file.name}`;
                  const uploadRes = await fetch(
                    `${SUPABASE_URL}/storage/v1/object/documents/${fileName}`,
                    { method: "POST", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}`, "Content-Type": file.type }, body: file }
                  );
                  if (!uploadRes.ok) {
                    const err = await uploadRes.json();
                    throw new Error(err.message || "Upload échoué");
                  }
                  // 2. URL publique
                  const publicUrl = `${SUPABASE_URL}/storage/v1/object/public/documents/${fileName}`;
                  // 3. Sauvegarder la métadonnée en base
                  await db.post("documents", {
                    nom: file.name,
                    type: newDocType,
                    client: newDocClient,
                    taille: file.size,
                    url: publicUrl,
                    storage_path: fileName,
                  });
                  setShowAddDoc(false);
                  setSelectedFile(null);
                  setNewDocClient("");
                  setNewDocType("Autre");
                  loadAll();
                } catch (err) {
                  alert("Erreur lors de l'upload : " + err.message);
                } finally {
                  setDocUploading(false);
                }
              };

              const deleteDoc = async (doc) => {
                if (!window.confirm(`Supprimer "${doc.nom}" ?`)) return;
                // Supprimer du storage
                await fetch(`${SUPABASE_URL}/storage/v1/object/documents/${doc.storage_path}`, {
                  method: "DELETE", headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
                });
                // Supprimer la métadonnée
                await db.delete("documents", doc.id);
                loadAll();
              };

              const filtered = docFilter === "Tous" ? documents : documents.filter(d => d.type === docFilter);

              return (
                <div>
                  {/* Modal upload */}
                  {showAddDoc && (
                    <Modal title="Déposer un document" onClose={() => { setShowAddDoc(false); setSelectedFile(null); }}>
                      <div style={S.formGroup}>
                        <label style={S.label}>Client / Dossier</label>
                        <select value={newDocClient} onChange={e => setNewDocClient(e.target.value)} style={S.select}>
                          <option value="">— Sélectionner —</option>
                          <option value="Cabinet">Cabinet (interne)</option>
                          {clients.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                        </select>
                      </div>
                      <div style={S.formGroup}>
                        <label style={S.label}>Catégorie</label>
                        <select value={newDocType} onChange={e => setNewDocType(e.target.value)} style={S.select}>
                          {["Bilan","Contrat","Liasse","Courrier","Rapport","Autre"].map(t => <option key={t}>{t}</option>)}
                        </select>
                      </div>
                      <div style={S.formGroup}>
                        <label style={S.label}>Fichier *</label>
                        <label style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8, padding: "24px 16px", borderRadius: 10, border: `2px dashed ${selectedFile ? "#1a7a4a" : "#87CEEB"}`, background: selectedFile ? "#f0faf4" : "#f0f8ff", cursor: "pointer", textAlign: "center", transition: "all 0.2s" }}>
                          <span style={{ fontSize: 28 }}>{selectedFile ? "✅" : "📂"}</span>
                          <span style={{ fontSize: 13, color: selectedFile ? "#1a7a4a" : "#1a5c9e", fontWeight: 700 }}>
                            {selectedFile ? selectedFile.name : "Cliquer pour choisir un fichier"}
                          </span>
                          {selectedFile ? (
                            <span style={{ fontSize: 11, color: "#1a7a4a" }}>{(selectedFile.size / 1024).toFixed(0)} Ko — prêt à déposer</span>
                          ) : (
                            <span style={{ fontSize: 11, color: "#8da4c0" }}>PDF, Word, Excel — max 10 Mo</span>
                          )}
                          <input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls,.csv"
                            onChange={e => setSelectedFile(e.target.files[0] || null)}
                            style={{ display: "none" }} disabled={docUploading} />
                        </label>
                        {selectedFile && (
                          <button onClick={() => setSelectedFile(null)}
                            style={{ marginTop: 6, fontSize: 11, color: "#c0392b", background: "none", border: "none", cursor: "pointer", textDecoration: "underline", alignSelf: "flex-start" }}>
                            ✕ Retirer le fichier
                          </button>
                        )}
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 8 }}>
                        <button onClick={() => { setShowAddDoc(false); setSelectedFile(null); }}
                          style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>
                          Annuler
                        </button>
                        <button onClick={() => uploadDoc(selectedFile)} disabled={!selectedFile || docUploading}
                          style={{ ...S.primaryBtn, opacity: (!selectedFile || docUploading) ? 0.5 : 1, cursor: (!selectedFile || docUploading) ? "not-allowed" : "pointer" }}>
                          {docUploading ? "⏳ Dépôt en cours..." : "⬆ Valider le dépôt"}
                        </button>
                      </div>
                    </Modal>
                  )}

                  {/* KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Total documents", value: documents.length, color: "#1a5c9e", bg: "#e8f0fb", emoji: "📁" },
                      { label: "Cette semaine", value: documents.filter(d => d.created_at && (new Date() - new Date(d.created_at)) < 7*86400000).length, color: "#1a7a4a", bg: "#e8f5ee", emoji: "🆕" },
                      { label: "Clients couverts", value: new Set(documents.map(d => d.client).filter(Boolean)).size, color: "#8e44ad", bg: "#f5eefb", emoji: "🤝" },
                      { label: "Taille totale", value: formatSize(documents.reduce((s, d) => s + (d.taille || 0), 0)), color: "#c17f2a", bg: "#fff8e6", emoji: "💾" },
                    ].map((k, i) => (
                      <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: isMobile ? "12px" : "14px 16px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", borderTop: "3px solid " + k.color }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{k.emoji}</div>
                        <div style={{ fontSize: isMobile ? 18 : 22, fontWeight: 800, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: "#6b8aaa", fontWeight: 600 }}>{k.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Toolbar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                      {categories.map(f => (
                        <button key={f} onClick={() => setDocFilter(f)} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2eaf4", background: docFilter === f ? "#1a5c9e" : "#fff", color: docFilter === f ? "#fff" : "#4a6d8c", cursor: "pointer", fontSize: 12, fontWeight: docFilter === f ? 700 : 400 }}>
                          {f} {f !== "Tous" ? `(${documents.filter(d => d.type === f).length})` : `(${documents.length})`}
                        </button>
                      ))}
                    </div>
                    {canDo("documents","ajouter") && <button onClick={() => setShowAddDoc(true)} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Déposer</button>}
                  </div>

                  {/* Liste */}
                  <div className="card-hover" style={S.card}>
                    {filtered.length === 0 ? (
                      <div style={{ textAlign: "center", padding: 40 }}>
                        <div style={{ fontSize: 40, marginBottom: 12 }}>📂</div>
                        <div style={{ fontSize: 15, fontWeight: 700, color: "#1e3a57", marginBottom: 6 }}>Aucun document</div>
                        <div style={{ fontSize: 13, color: "#8da4c0", marginBottom: 16 }}>Déposez votre premier fichier</div>
                        <button onClick={() => setShowAddDoc(true)} style={S.primaryBtn}>+ Déposer un document</button>
                      </div>
                    ) : filtered.map((d, i) => {
                      const color = extColor(d.nom);
                      return (
                        <div key={d.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < filtered.length - 1 ? "1px solid #f0f4fa" : "none", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                          <div style={{ width: 36, height: 36, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon d={ic.docs} size={16} stroke={color} />
                          </div>
                          <div style={{ flex: 2, minWidth: 120 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a57", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.nom}</div>
                            <div style={{ fontSize: 11, color: "#8da4c0" }}>{d.client || "—"}</div>
                          </div>
                          <div style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "#f0f4fa", color: "#4a6d8c", flexShrink: 0 }}>{d.type || "—"}</div>
                          <div style={{ fontSize: 12, color: "#8da4c0", flexShrink: 0 }}>{formatSize(d.taille)}</div>
                          <div style={{ fontSize: 12, color: "#8da4c0", flexShrink: 0, minWidth: 80 }}>{d.created_at ? new Date(d.created_at).toLocaleDateString("fr-FR") : "—"}</div>
                          <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                            {d.url && (
                              <a href={d.url} target="_blank" rel="noreferrer"
                                style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", textDecoration: "none" }}
                                title="Télécharger">
                                <Icon d={ic.download} size={13} stroke="#1a5c9e" />
                              </a>
                            )}
                            {canDo("documents","supprimer") && <button onClick={() => deleteDoc(d)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })()}


            {/* ── ABONNEMENTS ── */}
            {page === "abonnements" && (() => {
              const actifs = abonnements.filter(a => a.statut === "Actif");
              const suspendus = abonnements.filter(a => a.statut === "Suspendu");
              const resilies = abonnements.filter(a => a.statut === "Résilié");
              const freqMult = { "Mensuel": 1, "Trimestriel": 3, "Semestriel": 6, "Annuel": 12 };
              const mrr = actifs.reduce((s, a) => {
                const mult = freqMult[a.frequence] || 1;
                return s + (a.montant || 0) / mult;
              }, 0);
              const arr = mrr * 12;
              const now = new Date();
              const enRetard = actifs.filter(a => a.prochaine_echeance && new Date(a.prochaine_echeance) < now);
              const statutColors = { "Actif": { bg: "#e8f5ee", color: "#1a7a4a", border: "#1a7a4a" }, "Suspendu": { bg: "#fff8e6", color: "#c17f2a", border: "#c17f2a" }, "Résilié": { bg: "#fff0f0", color: "#c0392b", border: "#c0392b" } };

              return (
                <div>
                  {/* KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                    {[
                      { label: "MRR", value: Math.round(mrr).toLocaleString("fr-FR") + " FCFA", delta: "Revenu mensuel récurrent", color: "#1a5c9e", icon: ic.abonnement },
                      { label: "ARR", value: Math.round(arr).toLocaleString("fr-FR") + " FCFA", delta: "Revenu annuel récurrent", color: "#1a7a4a", icon: ic.trend },
                      { label: "Abonnés actifs", value: actifs.length, delta: suspendus.length + " suspendu(s)", color: "#1a5c9e", icon: ic.clients },
                      { label: "En retard", value: enRetard.length, delta: resilies.length + " résilié(s)", color: enRetard.length > 0 ? "#c0392b" : "#1a7a4a", icon: ic.alert },
                    ].map((k, i) => (
                      <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: isMobile ? "12px" : "16px 18px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", display: "flex", flexDirection: "column", gap: 4, borderTop: "3px solid " + k.color }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: k.color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                          <Icon d={k.icon} size={16} stroke={k.color} />
                        </div>
                        <div style={{ fontSize: isMobile ? 16 : 20, fontWeight: 800, color: "#1e3a57" }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: "#6b8aaa", fontWeight: 500 }}>{k.label}</div>
                        <div style={{ fontSize: 10, color: "#8da4c0" }}>{k.delta}</div>
                      </div>
                    ))}
                  </div>

                  {/* Alertes retard */}
                  {enRetard.length > 0 && (
                    <div style={{ background: "#fff0f0", border: "1px solid #f5b8b8", borderRadius: 10, padding: "12px 16px", marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
                      <Icon d={ic.alert} size={18} stroke="#c0392b" />
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: "#c0392b" }}>⚠️ {enRetard.length} abonnement(s) en retard de paiement</div>
                        <div style={{ fontSize: 11, color: "#c0392b", marginTop: 2 }}>{enRetard.map(a => a.client).join(", ")}</div>
                      </div>
                    </div>
                  )}

                  {/* Toolbar */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", gap: 6 }}>
                      {["Tous", "Actif", "Suspendu", "Résilié"].map(f => (
                        <button key={f} onClick={() => {}} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2eaf4", background: "#fff", color: "#4a6d8c", cursor: "pointer", fontSize: 12 }}>{f} ({f === "Tous" ? abonnements.length : abonnements.filter(a => a.statut === f).length})</button>
                      ))}
                    </div>
                    {canDo("abonnements","ajouter") && <button onClick={() => { setNewAbo({ client: clients[0]?.nom || "", services: [], montant: "", frequence: "Mensuel", date_debut: new Date().toISOString().split("T")[0], statut: "Actif", note: "" }); setShowAddAbo(true); }} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Nouvel abonnement</button>}
                  </div>

                  {/* Liste */}
                  <div className="card-hover" style={S.card}>
                    {abonnements.length === 0 && <div style={S.empty}>Aucun abonnement enregistré</div>}
                    {abonnements.map((a, i) => {
                      const sc = statutColors[a.statut] || statutColors["Actif"];
                      const echeance = a.prochaine_echeance ? new Date(a.prochaine_echeance) : null;
                      const daysLeft = echeance ? Math.round((echeance - now) / 86400000) : null;
                      const isLate = daysLeft !== null && daysLeft < 0;
                      const isSoon = daysLeft !== null && daysLeft >= 0 && daysLeft <= 7;
                      return (
                        <div key={a.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 12, padding: "14px 0", borderBottom: "1px solid #f0f4fa", flexWrap: isMobile ? "wrap" : "nowrap",
                          background: isLate ? "#fff9f9" : "transparent",
                          borderLeft: isLate ? "3px solid #c0392b" : isSoon ? "3px solid #c17f2a" : "3px solid transparent",
                          paddingLeft: 8 }}>
                          {/* Client & service */}
                          <div style={{ flex: 2, minWidth: 140 }}>
                            <div style={{ fontWeight: 700, fontSize: 13, color: "#1e3a57" }}>{a.client}</div>
                            <div style={{ fontSize: 11, color: "#6b8aaa", marginTop: 2 }}>{a.service}</div>
                            {a.note && <div style={{ fontSize: 10, color: "#8da4c0", marginTop: 2, fontStyle: "italic" }}>{a.note}</div>}
                          </div>
                          {/* Montant & fréquence */}
                          <div style={{ flex: 1, minWidth: 100 }}>
                            <div style={{ fontWeight: 800, fontSize: 14, color: "#1a5c9e" }}>{(a.montant || 0).toLocaleString("fr-FR")} FCFA</div>
                            <div style={{ fontSize: 11, color: "#8da4c0" }}>{a.frequence}</div>
                          </div>
                          {/* Échéance */}
                          <div style={{ flex: 1, minWidth: 90 }}>
                            {echeance ? (
                              <>
                                <div style={{ fontSize: 12, fontWeight: 600, color: isLate ? "#c0392b" : isSoon ? "#c17f2a" : "#1e3a57" }}>{echeance.toLocaleDateString("fr-FR")}</div>
                                <div style={{ fontSize: 11, color: isLate ? "#c0392b" : isSoon ? "#c17f2a" : "#8da4c0", fontWeight: isLate || isSoon ? 700 : 400 }}>
                                  {isLate ? "⚠️ " + Math.abs(daysLeft) + "j de retard" : isSoon ? "⏰ J-" + daysLeft : "J-" + daysLeft}
                                </div>
                              </>
                            ) : <div style={{ fontSize: 11, color: "#8da4c0" }}>—</div>}
                          </div>
                          {/* Statut */}
                          <span style={{ fontSize: 11, fontWeight: 700, padding: "4px 10px", borderRadius: 20, background: sc.bg, color: sc.color, border: "1px solid " + sc.border, flexShrink: 0 }}>{a.statut}</span>
                          {/* Actions */}
                          <div style={{ display: "flex", gap: 5, flexShrink: 0 }}>
                            <button title="Voir détail" onClick={() => setViewAbo(a)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.eye} size={13} stroke="#1a5c9e" /></button>
                            {a.statut === "Actif" && canDo("abonnements","modifier") && <button title="Suspendre" onClick={() => toggleAboStatut(a, "Suspendu")} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #f0d080", background: "#fff8e6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="#c17f2a"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg></button>}
                            {a.statut === "Suspendu" && canDo("abonnements","modifier") && <button title="Réactiver" onClick={() => toggleAboStatut(a, "Actif")} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #c3e6cb", background: "#e8f5ee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="#1a7a4a"><polygon points="5,3 19,12 5,21"/></svg></button>}
                            {a.statut !== "Résilié" && canDo("abonnements","modifier") && <button title="Résilier" onClick={() => { if(window.confirm("Résilier cet abonnement ?")) toggleAboStatut(a, "Résilié"); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🚫</button>}
                            {a.statut === "Résilié" && canDo("abonnements","supprimer") && <button title="Supprimer" onClick={() => { if(window.confirm("Supprimer définitivement ?")) deleteAbo(a.id); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Répartition MRR par fréquence */}
                  {actifs.length > 0 && (
                    <div className="card-hover" style={{ ...S.card, marginTop: 16 }}>
                      <div style={S.cardHeader}><Icon d={ic.trend} size={16} stroke="#1a5c9e" /><span style={S.cardTitle}>Répartition du MRR par fréquence</span></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {["Mensuel","Trimestriel","Semestriel","Annuel"].map(freq => {
                          const items = actifs.filter(a => a.frequence === freq);
                          const mrrFreq = items.reduce((s, a) => s + (a.montant || 0) / (freqMult[freq] || 1), 0);
                          if (items.length === 0) return null;
                          return (
                            <div key={freq} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                              <div style={{ width: 90, fontSize: 12, color: "#4a6d8c", flexShrink: 0 }}>{freq} ({items.length})</div>
                              <div style={{ flex: 1, height: 8, background: "#f0f4fa", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: mrr > 0 ? (mrrFreq/mrr*100) + "%" : "0%", height: "100%", background: "linear-gradient(90deg,#2e7fcf,#1a5c9e)", borderRadius: 4 }} />
                              </div>
                              <div style={{ width: 130, fontSize: 12, fontWeight: 700, color: "#1e3a57", textAlign: "right" }}>{Math.round(mrrFreq).toLocaleString("fr-FR")} FCFA/mois</div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}


            {/* ── SERVICES ── */}
            {page === "services" && (() => {
              const GROUPES = ["Assistance Comptable", "Assistance Fiscale", "Assistance Sociale", "Assistance Juridique"];
              const groupColors = {
                "Assistance Comptable": { color: "#1a5c9e", bg: "#e8f0fb", icon: ic.folder },
                "Assistance Fiscale":   { color: "#c0392b", bg: "#fff0f0", icon: ic.devis },
                "Assistance Sociale":   { color: "#1a7a4a", bg: "#e8f5ee", icon: ic.collab },
                "Assistance Juridique": { color: "#8e44ad", bg: "#f5eefb", icon: ic.docs },
              };

              // Merge static defaults with dynamic services from DB
              const DEFAULTS = [
                { groupe: "Assistance Comptable", nom: "Conseils et stratégies financiers", tarif: null },
                { groupe: "Assistance Comptable", nom: "Analyse et diagnostic financier", tarif: null },
                { groupe: "Assistance Comptable", nom: "Ingénierie financière", tarif: null },
                { groupe: "Assistance Comptable", nom: "Installation et paramétrage de logiciel de gestion (Sage Saari...)", tarif: null },
                { groupe: "Assistance Comptable", nom: "Production des états financiers de systèmes (DSF - CEP - PT)", tarif: null },
                { groupe: "Assistance Comptable", nom: "Audit comptable", tarif: null },
                { groupe: "Assistance Comptable", nom: "Manuel de procédures", tarif: null },
                { groupe: "Assistance Fiscale", nom: "Déclaration fiscale (TVA - AIR/AIS - RTS - DSF)", tarif: null },
                { groupe: "Assistance Fiscale", nom: "Respect des échéances fiscales", tarif: null },
                { groupe: "Assistance Fiscale", nom: "Élaboration et rédaction des correspondances fiscales", tarif: null },
                { groupe: "Assistance Fiscale", nom: "Élaboration des mesures de sécurité juridico-fiscales", tarif: null },
                { groupe: "Assistance Fiscale", nom: "Élaboration légale des mesures d'optimisation fiscale", tarif: null },
                { groupe: "Assistance Fiscale", nom: "Audit et simulation fiscale avant dépôt DSF", tarif: null },
                { groupe: "Assistance Fiscale", nom: "Constitution d'office en phase juridictionnelle", tarif: null },
                { groupe: "Assistance Sociale", nom: "Déclarations sociales", tarif: null },
                { groupe: "Assistance Sociale", nom: "Respect des échéances", tarif: null },
                { groupe: "Assistance Sociale", nom: "Élaboration des correspondances sociales", tarif: null },
                { groupe: "Assistance Sociale", nom: "Élaboration des mesures de sécurité juridico-sociales", tarif: null },
                { groupe: "Assistance Sociale", nom: "Élaboration légale des mesures d'optimisation sociales annuelles", tarif: null },
                { groupe: "Assistance Juridique", nom: "Rédaction des contrats", tarif: null },
                { groupe: "Assistance Juridique", nom: "Rédaction des statuts sous seing privé", tarif: null },
                { groupe: "Assistance Juridique", nom: "Aide à la création d'entreprise", tarif: null },
                { groupe: "Assistance Juridique", nom: "Formation du personnel interne", tarif: null },
              ];

              // Merge: DB services override defaults by nom+groupe
              const allServices = DEFAULTS.map(def => {
                const dbMatch = services.find(s => s.nom === def.nom && s.groupe === def.groupe);
                return dbMatch || { ...def, id: null };
              });
              // Add extra services from DB not in defaults
              services.forEach(s => {
                if (!DEFAULTS.find(d => d.nom === s.nom && d.groupe === s.groupe)) {
                  allServices.push(s);
                }
              });

              const totalServices = allServices.length;

              return (
                <div>
                  {/* KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                    {GROUPES.map((g, i) => {
                      const gc = groupColors[g];
                      const count = allServices.filter(s => s.groupe === g).length;
                      return (
                        <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", borderTop: `3px solid ${gc.color}` }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: gc.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                            <Icon d={gc.icon} size={16} stroke={gc.color} />
                          </div>
                          <div style={{ fontSize: 22, fontWeight: 800, color: gc.color }}>{count}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#1e3a57", marginTop: 2 }}>{g}</div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Bouton ajouter */}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, background: "#f5f8fc", border: "1px solid #87CEEB", borderRadius: 8, padding: "7px 14px", flex: isMobile ? "1" : "0 0 260px" }}>
                      <Icon d={ic.search} size={15} stroke="#8da4c0" />
                      <input placeholder="Rechercher un service…" value={serviceSearch} onChange={e => setServiceSearch(e.target.value)} style={{ border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1e3a57", width: "100%" }} />
                    </div>
                    {canDo("services","ajouter") && <button onClick={() => { setNewService({ nom: "", description: "", tarif: "", unite: "forfait", groupe: "Assistance Comptable", actif: true }); setShowAddService(true); }} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Nouveau service</button>}
                  </div>

                  {/* Groupes */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {GROUPES.map((g, gi) => {
                      const gc = groupColors[g];
                      const groupItems = allServices.filter(s => s.groupe === g && (serviceSearch === "" || s.nom.toLowerCase().includes(serviceSearch.toLowerCase())));
                      return (
                        <div key={gi} className="card-hover" style={{ ...S.card, borderLeft: `4px solid ${gc.color}` }}>
                          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${gc.bg}` }}>
                            <div style={{ width: 40, height: 40, borderRadius: 10, background: gc.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <Icon d={gc.icon} size={18} stroke={gc.color} />
                            </div>
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3a57" }}>{g}</div>
                              <div style={{ fontSize: 12, color: "#8da4c0" }}>{groupItems.length} service{groupItems.length > 1 ? "s" : ""}</div>
                            </div>
                          </div>
                          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 10 }}>
                            {groupItems.map((item, ii) => (
                              <div key={ii} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 9, background: gc.bg, position: "relative" }}>
                                <div style={{ width: 20, height: 20, borderRadius: "50%", background: gc.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                  <Icon d={ic.check} size={11} stroke="#fff" />
                                </div>
                                <div style={{ flex: 1, minWidth: 0 }}>
                                  <div style={{ fontSize: 13, color: "#1e3a57", fontWeight: 500, lineHeight: 1.4 }}>{item.nom}</div>
                                  {item.tarif && <div style={{ fontSize: 12, fontWeight: 700, color: gc.color, marginTop: 4 }}>{Number(item.tarif).toLocaleString("fr-FR")} FCFA / {item.unite || "forfait"}</div>}
                                </div>
                                <div style={{ display: "flex", gap: 4, flexShrink: 0 }}>
                                  {canDo("services","modifier") && <button onClick={() => { setEditService(item); setShowEditService(true); }} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e2eaf4", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon d={ic.trend} size={12} stroke="#1a5c9e" />
                                  </button>}
                                  {item.id && canDo("services","supprimer") && <button onClick={() => deleteService(item.id)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={12} stroke="#c0392b" /></button>}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Footer */}
                  <div style={{ marginTop: 16, textAlign: "center", padding: "14px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,30,80,.06)" }}>
                    <span style={{ fontSize: 13, color: "#6b8aaa" }}>Total : </span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#1a5c9e" }}>{totalServices} services</span>
                    <span style={{ fontSize: 13, color: "#6b8aaa" }}> répartis en </span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#1a5c9e" }}>{GROUPES.length} groupes</span>
                  </div>
                </div>
              );
            })()}


            {/* ── DÉPENSES ── */}
            {page === "depenses" && (
              <div>
                {/* Période selector */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {[["jour", "Aujourd’hui"], ["semestre", "Ce semestre"], ["annee", "Cette année"], ["tout", "Tout"]].map(([val, label]) => (
                      <button key={val} onClick={() => setDepensePeriode(val)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e2eaf4", background: depensePeriode === val ? "#1a5c9e" : "#fff", color: depensePeriode === val ? "#fff" : "#4a6d8c", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{label}</button>
                    ))}
                  </div>
                  {canDo("depenses","ajouter") && <button onClick={() => setShowAddDepense(true)} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Nouvelle dépense</button>}
                </div>

                {/* KPIs période */}
                {(() => {
                  const filtered = filterDepenses(depensePeriode);
                  const total = filtered.reduce((s, d) => s + (d.montant || 0), 0);
                  const cats = {};
                  filtered.forEach(d => { cats[d.categorie] = (cats[d.categorie] || 0) + d.montant; });
                  const topCat = Object.entries(cats).sort((a,b) => b[1]-a[1])[0];
                  return (
                    <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                      {[
                        { label: "Total dépenses", value: total.toLocaleString("fr-FR") + " FCFA", color: "#c0392b", icon: ic.depenses },
                        { label: "Nb de dépenses", value: filtered.length, color: "#1a5c9e", icon: ic.folder },
                        { label: "Catégorie principale", value: topCat ? topCat[0] : "—", color: "#c17f2a", icon: ic.alert },
                        { label: "Moyenne / dépense", value: filtered.length ? Math.round(total/filtered.length).toLocaleString("fr-FR") + " FCFA" : "—", color: "#1a7a4a", icon: ic.trend },
                      ].map((k, i) => (
                        <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: isMobile ? "12px" : "16px 18px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", display: "flex", flexDirection: "column", gap: 4 }}>
                          <div style={{ width: 34, height: 34, borderRadius: 9, background: k.color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                            <Icon d={k.icon} size={16} stroke={k.color} />
                          </div>
                          <div style={{ fontSize: isMobile ? 14 : 18, fontWeight: 800, color: "#1e3a57", lineHeight: 1.2 }}>{k.value}</div>
                          <div style={{ fontSize: 11, color: "#6b8aaa" }}>{k.label}</div>
                        </div>
                      ))}
                    </div>
                  );
                })()}

                {/* Répartition par catégorie */}
                {(() => {
                  const filtered = filterDepenses(depensePeriode);
                  const total = filtered.reduce((s, d) => s + (d.montant || 0), 0);
                  const cats = {};
                  filtered.forEach(d => { cats[d.categorie] = (cats[d.categorie] || 0) + d.montant; });
                  const catColors = { Fournitures: "#1a5c9e", Loyer: "#1a7a4a", Salaires: "#c17f2a", Transport: "#8e44ad", Informatique: "#c0392b", Communication: "#2980b9", Honoraires: "#e67e22", Autres: "#7f8c8d" };
                  return Object.keys(cats).length > 0 ? (
                    <div className="card-hover" style={{ ...S.card, marginBottom: 16 }}>
                      <div style={S.cardHeader}><Icon d={ic.trend} size={16} stroke="#1a5c9e" /><span style={S.cardTitle}>Répartition par catégorie</span></div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                        {Object.entries(cats).sort((a,b) => b[1]-a[1]).map(([cat, montant]) => (
                          <div key={cat} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                            <div style={{ width: 100, fontSize: 12, color: "#4a6d8c", flexShrink: 0 }}>{cat}</div>
                            <div style={{ flex: 1, height: 8, background: "#f0f4fa", borderRadius: 4, overflow: "hidden" }}>
                              <div style={{ width: `${total ? (montant/total*100) : 0}%`, height: "100%", background: catColors[cat] || "#1a5c9e", borderRadius: 4 }} />
                            </div>
                            <div style={{ width: 120, fontSize: 12, fontWeight: 700, color: "#1e3a57", textAlign: "right" }}>{montant.toLocaleString("fr-FR")} FCFA</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null;
                })()}

                {/* Liste des dépenses */}
                <div className="card-hover" style={S.card}>
                  <div style={S.cardHeader}><Icon d={ic.depenses} size={16} stroke="#c0392b" /><span style={S.cardTitle}>Liste des dépenses — {{"jour": "Aujourd’hui", "semestre": "Ce semestre", "annee": "Cette année", "tout": "Tout"}[depensePeriode]}</span></div>
                  {filterDepenses(depensePeriode).length === 0 && <div style={S.empty}>Aucune dépense enregistrée pour cette période</div>}
                  {filterDepenses(depensePeriode).map((d, i) => {
                    const catColors = { Fournitures: "#1a5c9e", Loyer: "#1a7a4a", Salaires: "#c17f2a", Transport: "#8e44ad", Informatique: "#c0392b", Communication: "#2980b9", Honoraires: "#e67e22", Autres: "#7f8c8d" };
                    const color = catColors[d.categorie] || "#6b8aaa";
                    return (
                      <div key={d.id} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0f4fa", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                        <div style={{ width: 36, height: 36, borderRadius: 8, background: color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon d={ic.depenses} size={15} stroke={color} />
                        </div>
                        <div style={{ flex: 2, minWidth: 120 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a57" }}>{d.libelle}</div>
                          {d.note && <div style={{ fontSize: 11, color: "#8da4c0" }}>{d.note}</div>}
                        </div>
                        <div style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: color + "18", color, flexShrink: 0 }}>{d.categorie}</div>
                        <div style={{ fontSize: 12, color: "#8da4c0", flexShrink: 0 }}>{d.date ? new Date(d.date).toLocaleDateString("fr-FR") : "—"}</div>
                        <div style={{ fontWeight: 800, fontSize: 14, color: "#c0392b", flexShrink: 0, minWidth: 120, textAlign: "right" }}>{(d.montant || 0).toLocaleString("fr-FR")} FCFA</div>
                        {canDo("depenses","supprimer") && <button onClick={() => deleteDepense(d.id)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}



            {/* ── ÉCHÉANCES FISCALES ── */}
            {page === "echeances" && (() => {
              const moisNoms = ["Janvier","Février","Mars","Avril","Mai","Juin","Juillet","Août","Septembre","Octobre","Novembre","Décembre"];
              const moisCourts = ["Jan","Fév","Mar","Avr","Mai","Jun","Jul","Aoû","Sep","Oct","Nov","Déc"];
              const joursNoms = ["Lun","Mar","Mer","Jeu","Ven","Sam","Dim"];
              const typesEcheances = [
                "Déclaration TVA", "DSF (Déclaration Statistique et Fiscale)",
                "Acompte IS (Impôt sur les Sociétés)", "Patente", "Taxe foncière",
                "CNPS / Cotisations sociales", "Retenue à la source",
                "Déclaration IGS", "Droits d'enregistrement", "Autre"
              ];

              const now = new Date();
              // Calcul du calendrier
              const premierJour = new Date(echeanceAnnee, echeanceMois, 1);
              const dernierJour = new Date(echeanceAnnee, echeanceMois + 1, 0);
              const debutCalendrier = new Date(premierJour);
              const jourSemaine = (premierJour.getDay() + 6) % 7; // Lundi = 0
              debutCalendrier.setDate(debutCalendrier.getDate() - jourSemaine);

              const jours = [];
              const d = new Date(debutCalendrier);
              while (d <= dernierJour || jours.length % 7 !== 0) {
                jours.push(new Date(d));
                d.setDate(d.getDate() + 1);
                if (jours.length > 42) break;
              }

              const echeancesDuMois = echeances.filter(e => {
                const de = new Date(e.date_echeance);
                return de.getFullYear() === echeanceAnnee && de.getMonth() === echeanceMois;
              });

              const getEcheancesJour = (date) => {
                const ds = date.toISOString().split("T")[0];
                return echeances.filter(e => e.date_echeance === ds);
              };

              const statutColor = { "À faire": "#c17f2a", "En cours": "#1a5c9e", "Fait": "#1a7a4a", "En retard": "#c0392b" };
              const prioriteColor = { "Haute": "#c0392b", "Normale": "#1a5c9e", "Basse": "#8da4c0" };

              const addEcheance = async () => {
                if (!newEcheance.client || !newEcheance.type || !newEcheance.date_echeance) return;
                await db.post("echeances", newEcheance);
                setShowAddEcheance(false);
                setNewEcheance({ client: "", type: "", description: "", date_echeance: "", statut: "À faire", priorite: "Normale" });
                loadAll();
              };

              const deleteEcheance = async (id) => {
                if (!window.confirm("Supprimer cette échéance ?")) return;
                await db.delete("echeances", id);
                loadAll();
              };

              const updateStatut = async (e, statut) => {
                await db.patch("echeances", e.id, { statut });
                loadAll();
              };

              return (
                <div>
                  {/* Modal ajout */}
                  {showAddEcheance && (
                    <Modal title="Nouvelle échéance" onClose={() => setShowAddEcheance(false)}>
                      <div style={{ overflowY: "auto", maxHeight: "65vh" }}>
                        <div style={S.formGroup}>
                          <label style={S.label}>Client *</label>
                          <select value={newEcheance.client} onChange={e => setNewEcheance(p => ({ ...p, client: e.target.value }))} style={S.select}>
                            <option value="">— Choisir un client —</option>
                            {clients.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}
                          </select>
                        </div>
                        <div style={S.formGroup}>
                          <label style={S.label}>Type d'échéance *</label>
                          <select value={newEcheance.type} onChange={e => setNewEcheance(p => ({ ...p, type: e.target.value }))} style={S.select}>
                            <option value="">— Choisir —</option>
                            {typesEcheances.map(t => <option key={t}>{t}</option>)}
                          </select>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
                          <div style={S.formGroup}>
                            <label style={S.label}>Date d'échéance *</label>
                            <input type="date" value={newEcheance.date_echeance} onChange={e => setNewEcheance(p => ({ ...p, date_echeance: e.target.value }))} style={S.input} />
                          </div>
                          <div style={S.formGroup}>
                            <label style={S.label}>Priorité</label>
                            <select value={newEcheance.priorite} onChange={e => setNewEcheance(p => ({ ...p, priorite: e.target.value }))} style={S.select}>
                              {["Haute","Normale","Basse"].map(p => <option key={p}>{p}</option>)}
                            </select>
                          </div>
                        </div>
                        <div style={S.formGroup}>
                          <label style={S.label}>Description / Note</label>
                          <textarea value={newEcheance.description} onChange={e => setNewEcheance(p => ({ ...p, description: e.target.value }))}
                            placeholder="Détails sur cette échéance..." rows={3}
                            style={{ ...S.input, resize: "vertical" }} />
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
                        <button onClick={() => setShowAddEcheance(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
                        <button onClick={addEcheance} style={S.primaryBtn}>💾 Enregistrer</button>
                      </div>
                    </Modal>
                  )}

                  {/* Modal visualisation */}
                  {viewEcheance && (
                    <Modal title="Détail échéance" onClose={() => setViewEcheance(null)}>
                      <div style={{ padding: "14px 16px", borderRadius: 12, background: "#f5f8fc", marginBottom: 16 }}>
                        <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3a57" }}>{viewEcheance.client}</div>
                        <div style={{ fontSize: 13, color: "#4a6d8c", marginTop: 2 }}>{viewEcheance.type}</div>
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                        {[
                          { label: "Date", value: new Date(viewEcheance.date_echeance).toLocaleDateString("fr-FR") },
                          { label: "Priorité", value: viewEcheance.priorite },
                          { label: "Statut", value: viewEcheance.statut },
                        ].map((f, i) => (
                          <div key={i} style={{ background: "#f5f8fc", borderRadius: 8, padding: "8px 12px" }}>
                            <div style={{ fontSize: 10, color: "#8da4c0", fontWeight: 600 }}>{f.label}</div>
                            <div style={{ fontSize: 13, fontWeight: 700, color: "#1e3a57", marginTop: 2 }}>{f.value}</div>
                          </div>
                        ))}
                      </div>
                      {viewEcheance.description && (
                        <div style={{ padding: "10px 14px", borderRadius: 9, background: "#f5f8fc", fontSize: 13, color: "#4a6d8c", marginBottom: 14 }}>
                          📝 {viewEcheance.description}
                        </div>
                      )}
                      {/* Changer statut */}
                      <div style={{ marginBottom: 14 }}>
                        <div style={{ fontSize: 11, fontWeight: 700, color: "#8da4c0", marginBottom: 8 }}>Changer le statut</div>
                        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                          {["À faire","En cours","Fait","En retard"].map(s => (
                            <button key={s} onClick={() => { updateStatut(viewEcheance, s); setViewEcheance({ ...viewEcheance, statut: s }); }}
                              style={{ padding: "6px 12px", borderRadius: 8, border: `1px solid ${statutColor[s]}44`, background: viewEcheance.statut === s ? statutColor[s] : "transparent", color: viewEcheance.statut === s ? "#fff" : statutColor[s], cursor: "pointer", fontSize: 12, fontWeight: 600 }}>
                              {s}
                            </button>
                          ))}
                        </div>
                      </div>
                      <div style={{ display: "flex", gap: 10, justifyContent: "space-between" }}>
                        <button onClick={() => { deleteEcheance(viewEcheance.id); setViewEcheance(null); }}
                          style={{ padding: "9px 16px", borderRadius: 9, background: "#fff5f5", color: "#c0392b", border: "1px solid #fde8e8", cursor: "pointer", fontSize: 13 }}>
                          🗑 Supprimer
                        </button>
                        <button onClick={() => setViewEcheance(null)} style={{ padding: "9px 20px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Fermer</button>
                      </div>
                    </Modal>
                  )}

                  {/* KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Total", value: echeances.length, color: "#1a5c9e", emoji: "📅" },
                      { label: "À faire", value: echeances.filter(e => e.statut === "À faire").length, color: "#c17f2a", emoji: "⏳" },
                      { label: "En retard", value: echeances.filter(e => e.statut === "En retard" || (e.statut !== "Fait" && new Date(e.date_echeance) < now)).length, color: "#c0392b", emoji: "🔴" },
                      { label: "Faites", value: echeances.filter(e => e.statut === "Fait").length, color: "#1a7a4a", emoji: "✅" },
                    ].map((k, i) => (
                      <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", borderTop: "3px solid " + k.color }}>
                        <div style={{ fontSize: 22, marginBottom: 4 }}>{k.emoji}</div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: k.color }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: "#6b8aaa", fontWeight: 600 }}>{k.label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Navigation mois + bouton ajouter */}
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                      <button onClick={() => { if (echeanceMois === 0) { setEcheanceMois(11); setEcheanceAnnee(y => y - 1); } else setEcheanceMois(m => m - 1); }}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2eaf4", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>‹</button>
                      <span style={{ fontSize: 15, fontWeight: 800, color: "#1e3a57", minWidth: 160, textAlign: "center" }}>{moisNoms[echeanceMois]} {echeanceAnnee}</span>
                      <button onClick={() => { if (echeanceMois === 11) { setEcheanceMois(0); setEcheanceAnnee(y => y + 1); } else setEcheanceMois(m => m + 1); }}
                        style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2eaf4", background: "#fff", cursor: "pointer", fontWeight: 700, fontSize: 16 }}>›</button>
                      <button onClick={() => { setEcheanceMois(now.getMonth()); setEcheanceAnnee(now.getFullYear()); }}
                        style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2eaf4", background: "#f5f8fc", color: "#4a6d8c", cursor: "pointer", fontSize: 12 }}>Aujourd'hui</button>
                    </div>
                    <button onClick={() => setShowAddEcheance(true)} style={S.primaryBtn}>
                      <Icon d={ic.plus} size={14} stroke="#fff" /> Nouvelle échéance
                    </button>
                  </div>

                  {/* Calendrier */}
                  <div className="card-hover" style={{ ...S.card, marginBottom: 16 }}>
                    {/* En-tête jours */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 1, marginBottom: 4 }}>
                      {joursNoms.map(j => (
                        <div key={j} style={{ textAlign: "center", fontSize: 11, fontWeight: 700, color: "#8da4c0", padding: "6px 0" }}>{j}</div>
                      ))}
                    </div>
                    {/* Grille jours */}
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(7,1fr)", gap: 2 }}>
                      {jours.map((jour, i) => {
                        const estMoisCourant = jour.getMonth() === echeanceMois;
                        const estAujourdhui = jour.toDateString() === now.toDateString();
                        const echsJour = getEcheancesJour(jour);
                        return (
                          <div key={i} style={{ minHeight: isMobile ? 44 : 70, borderRadius: 8, background: estAujourdhui ? "#e8f0fb" : estMoisCourant ? "#fff" : "#f9fafc", border: estAujourdhui ? "2px solid #1a5c9e" : "1px solid #f0f4fa", padding: "4px", cursor: echsJour.length > 0 ? "pointer" : "default", position: "relative" }}
                            onClick={() => echsJour.length === 1 ? setViewEcheance(echsJour[0]) : null}>
                            <div style={{ fontSize: 11, fontWeight: estAujourdhui ? 800 : 500, color: estAujourdhui ? "#1a5c9e" : estMoisCourant ? "#1e3a57" : "#c0cfe0", textAlign: "right", marginBottom: 2 }}>
                              {jour.getDate()}
                            </div>
                            {echsJour.slice(0, isMobile ? 1 : 2).map((e, ei) => (
                              <div key={ei} onClick={ev => { ev.stopPropagation(); setViewEcheance(e); }}
                                style={{ fontSize: 9, fontWeight: 600, padding: "2px 4px", borderRadius: 3, background: statutColor[e.statut] || "#1a5c9e", color: "#fff", marginBottom: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", cursor: "pointer" }}>
                                {e.client}
                              </div>
                            ))}
                            {echsJour.length > 2 && !isMobile && (
                              <div style={{ fontSize: 9, color: "#8da4c0", textAlign: "center" }}>+{echsJour.length - 2}</div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Liste du mois */}
                  {echeancesDuMois.length > 0 && (
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}>
                        <Icon d={ic.calendar} size={16} stroke="#1a5c9e" />
                        <span style={S.cardTitle}>Échéances de {moisNoms[echeanceMois]}</span>
                        <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 700, background: "#e8f0fb", color: "#1a5c9e", padding: "3px 8px", borderRadius: 6 }}>{echeancesDuMois.length}</span>
                      </div>
                      {echeancesDuMois.sort((a, b) => new Date(a.date_echeance) - new Date(b.date_echeance)).map((e, i) => {
                        const days = Math.round((new Date(e.date_echeance) - now) / 86400000);
                        return (
                          <div key={e.id} onClick={() => setViewEcheance(e)} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: i < echeancesDuMois.length - 1 ? "1px solid #f0f4fa" : "none", cursor: "pointer" }}>
                            <div style={{ width: 36, height: 36, borderRadius: 9, background: (statutColor[e.statut] || "#1a5c9e") + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                              <span style={{ fontSize: 16 }}>{e.statut === "Fait" ? "✅" : e.statut === "En retard" ? "🔴" : e.statut === "En cours" ? "🔵" : "⏳"}</span>
                            </div>
                            <div style={{ flex: 1, minWidth: 0 }}>
                              <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a57" }}>{e.client}</div>
                              <div style={{ fontSize: 11, color: "#8da4c0" }}>{e.type}</div>
                            </div>
                            <div style={{ textAlign: "right", flexShrink: 0 }}>
                              <div style={{ fontSize: 12, fontWeight: 700, color: days < 0 ? "#c0392b" : days <= 7 ? "#c17f2a" : "#1a7a4a" }}>
                                {days < 0 ? `J+${Math.abs(days)}` : days === 0 ? "Aujourd'hui" : `J-${days}`}
                              </div>
                              <div style={{ fontSize: 10, color: "#8da4c0" }}>{new Date(e.date_echeance).toLocaleDateString("fr-FR")}</div>
                            </div>
                            <span style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: (prioriteColor[e.priorite] || "#1a5c9e") + "18", color: prioriteColor[e.priorite] || "#1a5c9e", flexShrink: 0 }}>{e.priorite}</span>
                          </div>
                        );
                      })}
                    </div>
                  )}

                </div>
              );
            })()}

            {/* ── PARAMÈTRES ── */}
            {page === "settings" && (
              <div style={{ maxWidth: 680 }}>
                <div className="card-hover" style={{ ...S.card, marginBottom: 16 }}>
                  <div style={S.cardHeader}><Icon d={ic.settings} size={16} stroke="#6b8aaa" /><span style={S.cardTitle}>Préférences</span></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={S.formGroup}>
                      <label style={S.label}>Devise</label>
                      <select style={S.select}>
                        <option>Franc CFA (XAF)</option>
                        <option>Dollar ($)</option>
                        <option>Euro (€)</option>
                      </select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Taux de TVA par défaut</label>
                      <select style={S.select}>
                        <option>19,25% (TVA Cameroun)</option>
                        <option>0% (Exonéré)</option>
                        <option>Suspension de TVA</option>
                      </select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Référentiel comptable</label>
                      <select style={S.select}>
                        <option>SYSCOHADA Révisé</option>
                        <option>SYSCOHADA</option>
                        <option>IFRS</option>
                      </select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Exercice fiscal</label>
                      <select style={S.select}>
                        <option>Janvier — Décembre</option>
                      </select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Langue</label>
                      <select style={S.select}>
                        <option>Français</option>
                        <option>Anglais</option>
                        <option>Bilingue (FR / EN)</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button style={S.primaryBtn}>Enregistrer</button>
                  </div>
                </div>

                {/* Section Administration */}
                <div className="card-hover" style={{ ...S.card, marginTop: 16, borderLeft: "4px solid #c0392b" }}>
                  <div style={S.cardHeader}>
                    <Icon d={ic.trash} size={16} stroke="#c0392b" />
                    <span style={{ ...S.cardTitle, color: "#c0392b" }}>Administration — Historique des devis</span>
                    <span style={{ marginLeft: "auto", fontSize: 10, fontWeight: 700, background: "#fff0f0", color: "#c0392b", padding: "3px 8px", borderRadius: 6 }}>ADMIN</span>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {[
                      { label: "Supprimer les brouillons", desc: "Efface tous les devis avec statut Brouillon", color: "#c17f2a", bg: "#fff8e6", border: "#f0d080", statut: "Brouillon", emoji: "📝" },
                      { label: "Supprimer les devis annulés", desc: "Efface tous les devis avec statut Annulé", color: "#8e44ad", bg: "#f5eefb", border: "#d7b8f5", statut: "Annulé", emoji: "🚫" },
                      { label: "Supprimer les devis enregistrés", desc: "Efface tous les devis enregistrés non payés", color: "#1a5c9e", bg: "#e8f0fb", border: "#b0c8e8", statut: "Enregistré", emoji: "📄" },
                      { label: "Vider tout l'historique", desc: "Supprime TOUS les devis sauf ceux Payés", color: "#c0392b", bg: "#fff0f0", border: "#f5b8b8", statut: "ALL", emoji: "🗑" },
                    ].map((action, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 16px", borderRadius: 10, background: action.bg, border: "1px solid " + action.border, flexWrap: "wrap", gap: 10 }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 700, color: action.color }}>{action.emoji} {action.label}</div>
                          <div style={{ fontSize: 11, color: "#8da4c0", marginTop: 2 }}>{action.desc}</div>
                          <div style={{ fontSize: 11, fontWeight: 600, color: action.color, marginTop: 4 }}>
                            {action.statut === "ALL"
                              ? devisList.filter(d => d.statut !== "Payé").length + " devis concernés"
                              : devisList.filter(d => d.statut === action.statut).length + " devis concernés"}
                          </div>
                        </div>
                        <button onClick={async () => {
                          const toDelete = action.statut === "ALL"
                            ? devisList.filter(d => d.statut !== "Payé")
                            : devisList.filter(d => d.statut === action.statut);
                          if (toDelete.length === 0) { alert("Aucun devis à supprimer."); return; }
                          const msg = action.statut === "ALL"
                            ? "Supprimer " + toDelete.length + " devis (sauf Payés) ? Action irréversible."
                            : "Supprimer " + toDelete.length + " devis " + action.statut + " ? Action irréversible.";
                          if (!window.confirm(msg)) return;
                          await Promise.all(toDelete.map(d => db.delete("devis", d.id)));
                          await loadAll();
                          alert(toDelete.length + " devis supprimé(s) avec succès.");
                        }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", borderRadius: 8, background: action.color, color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                          <Icon d={ic.trash} size={13} stroke="#fff" /> Supprimer
                        </button>
                      </div>
                    ))}
                  </div>
                  {/* Archivage par année */}
                  <div style={{ marginTop: 8, padding: "14px 16px", borderRadius: 10, background: "#f0f6ff", border: "1px solid #b0c8e8" }}>
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a5c9e", marginBottom: 10 }}>📦 Archiver les devis d&apos;une année</div>
                    <div style={{ fontSize: 11, color: "#6b8aaa", marginBottom: 12 }}>Supprime tous les devis non-Payés d&apos;une année sélectionnée. Les devis Payés sont conservés.</div>
                    <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
                      <select id="archiveYear" style={{ ...S.select, flex: 1, minWidth: 120 }}>
                        {[...new Set(devisList.map(d => new Date(d.created_at || d.date || Date.now()).getFullYear()))].sort((a,b) => b-a).map(y => (
                          <option key={y} value={y}>{y}</option>
                        ))}
                        {devisList.length === 0 && <option value={new Date().getFullYear()}>{new Date().getFullYear()}</option>}
                      </select>
                      <button onClick={async () => {
                        const yearEl = document.getElementById("archiveYear");
                        const year = parseInt(yearEl?.value || new Date().getFullYear());
                        const toDelete = devisList.filter(d => {
                          const dy = new Date(d.created_at || d.date || Date.now()).getFullYear();
                          return dy === year && d.statut !== "Payé";
                        });
                        if (toDelete.length === 0) { alert("Aucun devis non-Payé trouvé pour " + year + "."); return; }
                        if (!window.confirm("Archiver (supprimer) " + toDelete.length + " devis de " + year + " (sauf Payés) ? Action irréversible.")) return;
                        await Promise.all(toDelete.map(d => db.delete("devis", d.id)));
                        await loadAll();
                        alert(toDelete.length + " devis de " + year + " archivés avec succès.");
                      }} style={{ display: "flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 8, background: "#1a5c9e", color: "#fff", border: "none", cursor: "pointer", fontSize: 12, fontWeight: 600, flexShrink: 0 }}>
                        <Icon d={ic.folder} size={13} stroke="#fff" /> Archiver cette année
                      </button>
                    </div>
                    <div style={{ marginTop: 10, fontSize: 11, color: "#6b8aaa" }}>
                      {(() => {
                        const years = [...new Set(devisList.map(d => new Date(d.created_at || d.date || Date.now()).getFullYear()))].sort((a,b) => b-a);
                        return years.map(y => {
                          const count = devisList.filter(d => new Date(d.created_at || d.date || Date.now()).getFullYear() === y && d.statut !== "Payé").length;
                          const paid = devisList.filter(d => new Date(d.created_at || d.date || Date.now()).getFullYear() === y && d.statut === "Payé").length;
                          return <span key={y} style={{ marginRight: 12 }}><b style={{ color: "#1a5c9e" }}>{y}</b> : {count} archivable(s), {paid} payé(s)</span>;
                        });
                      })()}
                    </div>
                  </div>

                  <div style={{ marginTop: 14, padding: "10px 14px", background: "#fff8e6", borderRadius: 8, fontSize: 11, color: "#c17f2a", fontWeight: 500 }}>
                    Les devis <b>Payés</b> ne peuvent jamais être supprimés pour des raisons de traçabilité comptable.
                  </div>
                </div>
              </div>
            )}

          </>}
        </div>

        {/* BOTTOM NAV mobile */}
        {isMobile && (
          <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e2eaf4", display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
            {navItems.filter(item => ["dashboard", "clients", "services", "depenses", "devis", "rapports"].includes(item.id) && canSee(item.id)).map(item => (
              <button key={item.id} onClick={() => navigate(item.id)} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "10px 4px", background: "none", border: "none", cursor: "pointer", color: page === item.id ? "#1a5c9e" : "#8da4c0", position: "relative" }}>
                <Icon d={item.icon} size={20} stroke={page === item.id ? "#1a5c9e" : "#8da4c0"} />
                <span style={{ fontSize: 9, marginTop: 3, fontWeight: page === item.id ? 700 : 400 }}>{item.label.split(" ")[0]}</span>
                {item.badge > 0 && <span style={{ position: "absolute", top: 6, right: "50%", transform: "translateX(8px)", background: "#c0392b", color: "#fff", borderRadius: 10, fontSize: 9, fontWeight: 700, padding: "1px 5px" }}>{item.badge}</span>}
              </button>
            ))}
          </nav>
        )}
      </main>

      {/* MODALS */}
      {/* MODAL VISUALISATION CLIENT */}
      {viewClient && (
        <Modal title="Fiche client" onClose={() => setViewClient(null)}>
          <div style={{ paddingRight: 4 }}>

            {/* Entête */}
            <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg,#e8f0fb,#f0f6ff)", marginBottom: 16 }}>
              <div style={{ width: 52, height: 52, borderRadius: 13, background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: 20, flexShrink: 0 }}>{viewClient.nom?.charAt(0) || "?"}</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 800, color: "#1e3a57" }}>{viewClient.nom}</div>
                <div style={{ fontSize: 12, color: "#6b8aaa" }}>{viewClient.forme_juridique} {viewClient.secteur ? "— " + viewClient.secteur : ""}</div>
                <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: viewClient.statut === "Actif" ? "#e8f5ee" : viewClient.statut === "En attente" ? "#fff8e6" : "#f5f5f5", color: viewClient.statut === "Actif" ? "#1a7a4a" : viewClient.statut === "En attente" ? "#c17f2a" : "#8a9aac" }}>{viewClient.statut}</span>
              </div>
            </div>

            {/* Identification */}
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a5c9e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #e8f0fb" }}>📋 Identification</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "NIU", value: viewClient.nif },
                { label: "N° Contribuable", value: viewClient.numero_contribuable },
                { label: "N° RCCM", value: viewClient.rccm },
                { label: "N° Récépissé", value: viewClient.numero_recepisse },
                { label: "N° Patente", value: viewClient.patente },
                { label: "Date de création", value: viewClient.date_creation ? new Date(viewClient.date_creation).toLocaleDateString("fr-FR") : null },
                { label: "Date clôture", value: viewClient.date_cloture },
              ].filter(f => f.value).map((f, i) => (
                <div key={i} style={{ background: "#f5f8fc", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "#8da4c0", fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: "#1e3a57", fontWeight: 600, marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Localisation */}
            {(viewClient.region || viewClient.adresse) && <>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#1a7a4a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #e8f5ee" }}>📍 Localisation</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Région", value: viewClient.region },
                  { label: "Département", value: viewClient.departement },
                  { label: "Arrondissement", value: viewClient.arrondissement },
                  { label: "Adresse", value: viewClient.adresse },
                  { label: "Téléphone", value: viewClient.telephone },
                  { label: "Email", value: viewClient.email },
                  { label: "Site web", value: viewClient.site_web },
                ].filter(f => f.value).map((f, i) => (
                  <div key={i} style={{ background: "#f5f8fc", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10, color: "#8da4c0", fontWeight: 600 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: "#1e3a57", fontWeight: 600, marginTop: 2 }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </>}

            {/* Représentant légal */}
            {viewClient.dirigeant && <>
              <div style={{ fontSize: 11, fontWeight: 800, color: "#8e44ad", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #f5eefb" }}>👤 Représentant légal</div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
                {[
                  { label: "Dirigeant", value: viewClient.dirigeant },
                  { label: "Téléphone", value: viewClient.tel_dirigeant },
                  { label: "Email", value: viewClient.email_dirigeant },
                ].filter(f => f.value).map((f, i) => (
                  <div key={i} style={{ background: "#f5f8fc", borderRadius: 8, padding: "8px 12px" }}>
                    <div style={{ fontSize: 10, color: "#8da4c0", fontWeight: 600 }}>{f.label}</div>
                    <div style={{ fontSize: 13, color: "#1e3a57", fontWeight: 600, marginTop: 2 }}>{f.value}</div>
                  </div>
                ))}
              </div>
            </>}

            {/* Fiscalité */}
            <div style={{ fontSize: 11, fontWeight: 800, color: "#c17f2a", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #fff8e6" }}>📊 Fiscalité & Comptabilité</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
              {[
                { label: "Régime fiscal", value: viewClient.regime_fiscal },
                { label: "Centre des impôts", value: viewClient.centre_impots },
                { label: "TVA", value: viewClient.tva },
                { label: "Référentiel", value: viewClient.referentiel },
                { label: "Banque", value: viewClient.banque },
              ].filter(f => f.value).map((f, i) => (
                <div key={i} style={{ background: "#f5f8fc", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "#8da4c0", fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: "#1e3a57", fontWeight: 600, marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>

            {/* Suivi cabinet */}
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a5c9e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #e8f0fb" }}>🏢 Suivi cabinet</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              {[
                { label: "Responsable", value: viewClient.responsable },
                { label: "Type de mission", value: viewClient.type_mission },
                { label: "Date d'entrée", value: viewClient.date_entree ? new Date(viewClient.date_entree).toLocaleDateString("fr-FR") : null },
                { label: "Honoraires", value: viewClient.honoraires ? Number(viewClient.honoraires).toLocaleString("fr-FR") + " FCFA/an" : null },
                { label: "CA estimé", value: viewClient.ca ? Number(viewClient.ca).toLocaleString("fr-FR") + " FCFA/an" : null },
              ].filter(f => f.value).map((f, i) => (
                <div key={i} style={{ background: "#f5f8fc", borderRadius: 8, padding: "8px 12px" }}>
                  <div style={{ fontSize: 10, color: "#8da4c0", fontWeight: 600 }}>{f.label}</div>
                  <div style={{ fontSize: 13, color: "#1e3a57", fontWeight: 600, marginTop: 2 }}>{f.value}</div>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setViewClient(null)} style={{ padding: "9px 20px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Fermer</button>
          </div>
        </Modal>
      )}

      {/* MODAL EDITION CLIENT */}
      {editClient && (
        <Modal title="Modifier le client" onClose={() => setEditClient(null)}>
          <div style={{ paddingRight: 4 }}>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a5c9e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #e8f0fb" }}>📋 Identification</div>
            <div style={S.formGroup}><label style={S.label}>Raison sociale *</label><input value={editClient.nom || ""} onChange={e => setEditClient(p => ({ ...p, nom: e.target.value }))} style={S.input} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Forme juridique</label><select value={editClient.forme_juridique || ""} onChange={e => setEditClient(p => ({ ...p, forme_juridique: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["SARL","SA","SAS","EURL","GIE","Entreprise individuelle","Association","ONG","Coopérative","Autre"].map(f => <option key={f}>{f}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Secteur d'activité</label><input value={editClient.secteur || ""} onChange={e => setEditClient(p => ({ ...p, secteur: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>N° RCCM</label><input value={editClient.rccm || ""} onChange={e => setEditClient(p => ({ ...p, rccm: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>NIU</label><input value={editClient.nif || ""} onChange={e => setEditClient(p => ({ ...p, nif: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>N° Contribuable</label><input value={editClient.numero_contribuable || ""} onChange={e => setEditClient(p => ({ ...p, numero_contribuable: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>N° Récépissé</label><input placeholder="Ex: REC/2024/XXX" value={editClient.numero_recepisse || ""} onChange={e => setEditClient(p => ({ ...p, numero_recepisse: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>Date de création</label><input type="date" value={editClient.date_creation || ""} onChange={e => setEditClient(p => ({ ...p, date_creation: e.target.value }))} style={S.input} /></div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a7a4a", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 10px", paddingBottom: 6, borderBottom: "2px solid #e8f5ee" }}>📍 Localisation & Coordonnées</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Région</label><select value={editClient.region || ""} onChange={e => setEditClient(p => ({ ...p, region: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Adamaoua","Centre","Est","Extrême-Nord","Littoral","Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest"].map(r => <option key={r}>{r}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Département</label><input value={editClient.departement || ""} onChange={e => setEditClient(p => ({ ...p, departement: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Arrondissement / Ville</label><input value={editClient.arrondissement || ""} onChange={e => setEditClient(p => ({ ...p, arrondissement: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>Adresse</label><input value={editClient.adresse || ""} onChange={e => setEditClient(p => ({ ...p, adresse: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Téléphone</label><input value={editClient.telephone || ""} onChange={e => setEditClient(p => ({ ...p, telephone: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>Email</label><input type="email" value={editClient.email || ""} onChange={e => setEditClient(p => ({ ...p, email: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={S.formGroup}><label style={S.label}>Site web</label><input value={editClient.site_web || ""} onChange={e => setEditClient(p => ({ ...p, site_web: e.target.value }))} style={S.input} /></div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#8e44ad", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 10px", paddingBottom: 6, borderBottom: "2px solid #f5eefb" }}>👤 Représentant légal</div>
            <div style={S.formGroup}><label style={S.label}>Nom du dirigeant</label><input value={editClient.dirigeant || ""} onChange={e => setEditClient(p => ({ ...p, dirigeant: e.target.value }))} style={S.input} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Tél. dirigeant</label><input value={editClient.tel_dirigeant || ""} onChange={e => setEditClient(p => ({ ...p, tel_dirigeant: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>Email dirigeant</label><input type="email" value={editClient.email_dirigeant || ""} onChange={e => setEditClient(p => ({ ...p, email_dirigeant: e.target.value }))} style={S.input} /></div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#c17f2a", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 10px", paddingBottom: 6, borderBottom: "2px solid #fff8e6" }}>📊 Fiscalité & Comptabilité</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Régime fiscal</label><select value={editClient.regime_fiscal || ""} onChange={e => setEditClient(p => ({ ...p, regime_fiscal: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Régime de l'Impôt Général Synthétique (IGS)","Régime Réel","Régime des Organisations à But Non Lucratif","Régime des Contribuables Non Professionnels"].map(r => <option key={r}>{r}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Centre des impôts</label><select value={editClient.centre_impots || ""} onChange={e => setEditClient(p => ({ ...p, centre_impots: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["DGE (Direction des Grandes Entreprises)","CIME (Centre des Impôts des Moyennes Entreprises)","CFLP (Centre de Fiscalité Locale et des Particuliers)","CSI (Centre Spécialisé des Impôts)","CSIPL (Centre Spécialisé des Impôts des Professions Libérales)"].map(c => <option key={c}>{c}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Régime TVA</label><select value={editClient.tva || ""} onChange={e => setEditClient(p => ({ ...p, tva: e.target.value }))} style={S.select}>{["Assujetti 19,25%","Non assujetti","Exonéré","Suspension de TVA","Partiellement assujetti"].map(r => <option key={r}>{r}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Référentiel comptable</label><select value={editClient.referentiel || ""} onChange={e => setEditClient(p => ({ ...p, referentiel: e.target.value }))} style={S.select}>{["SYSCOHADA Révisé","SYSCOHADA","IFRS","Autre"].map(r => <option key={r}>{r}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Banque</label><select value={editClient.banque || ""} onChange={e => setEditClient(p => ({ ...p, banque: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Afriland First Bank","BICEC","CCA Bank","Ecobank","Société Générale","SCB Cameroun","UBA","BGFI Bank","Atlantic Bank","NFC Bank","Autre"].map(b => <option key={b}>{b}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>N° Patente</label><input value={editClient.patente || ""} onChange={e => setEditClient(p => ({ ...p, patente: e.target.value }))} style={S.input} /></div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a5c9e", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 10px", paddingBottom: 6, borderBottom: "2px solid #e8f0fb" }}>🏢 Suivi cabinet</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Responsable dossier</label><select value={editClient.responsable || ""} onChange={e => setEditClient(p => ({ ...p, responsable: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{collaborateurs.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Type de mission</label><select value={editClient.type_mission || ""} onChange={e => setEditClient(p => ({ ...p, type_mission: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Tenue comptable SYSCOHADA","Audit légal / CAC","Audit contractuel","Conseil fiscal & juridique","Gestion de la paie","Déclarations fiscales (DSF, TVA...)","Création / Immatriculation","Assistance DGI / Contentieux","Autre"].map(m => <option key={m}>{m}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Statut</label><select value={editClient.statut || "Actif"} onChange={e => setEditClient(p => ({ ...p, statut: e.target.value }))} style={S.select}>{["Actif","En attente","Inactif","Suspendu"].map(s => <option key={s}>{s}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Date d'entrée en relation</label><input type="date" value={editClient.date_entree || ""} onChange={e => setEditClient(p => ({ ...p, date_entree: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={S.formGroup}><label style={S.label}>Honoraires (FCFA/an)</label><input type="number" value={editClient.honoraires || ""} onChange={e => setEditClient(p => ({ ...p, honoraires: e.target.value }))} style={S.input} /></div>
            <div style={S.formGroup}><label style={S.label}>Chiffre d'affaires estimé (FCFA/an)</label><input type="number" placeholder="Ex: 50000000" value={editClient.ca || ""} onChange={e => setEditClient(p => ({ ...p, ca: e.target.value }))} style={S.input} /></div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
            <button onClick={() => setEditClient(null)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={updateClient} style={S.primaryBtn}>💾 Enregistrer</button>
          </div>
        </Modal>
      )}

      {showAddClient && (
        <Modal title="Nouveau client" onClose={() => setShowAddClient(false)}>
          <div style={{ overflowY: "auto", overflowX: "hidden", maxHeight: "70vh", paddingRight: 4 }}>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a5c9e", textTransform: "uppercase", letterSpacing: 1, marginBottom: 10, paddingBottom: 6, borderBottom: "2px solid #e8f0fb" }}>📋 Identification</div>
            <div style={S.formGroup}><label style={S.label}>Raison sociale *</label><input placeholder="Ex: SARL Dupont & Fils" value={newClient.nom} onChange={e => setNewClient(p => ({ ...p, nom: e.target.value }))} style={S.input} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Forme juridique</label><select value={newClient.forme_juridique} onChange={e => setNewClient(p => ({ ...p, forme_juridique: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["SARL","SA","SAS","EURL","GIE","Entreprise individuelle","Association","ONG","Coopérative","Autre"].map(f => <option key={f}>{f}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Secteur d'activité</label><select value={newClient.secteur} onChange={e => setNewClient(p => ({ ...p, secteur: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Agriculture / Élevage","Sylviculture / Exploitation forestière","Pêche / Aquaculture","Agro-industrie / Transformation alimentaire","Mines / Carrières","Hydrocarbures / Pétrole & Gaz","BTP / Génie civil","Immobilier / Promotion immobilière","Industrie manufacturière","Énergie / Électricité / Eau","Commerce général / Import-Export","Grande distribution / Supermarché","Commerce de véhicules / Pièces détachées","Pharmacie / Parapharmacie","Banque / Finance / Assurance","Informatique / Télécommunications","Transport / Logistique","Hôtellerie / Restauration / Tourisme","Santé / Clinique / Cabinet médical","Éducation / Formation / École","Conseil / Audit / Expertise","Médias / Communication / Publicité","Sécurité / Gardiennage","Nettoyage / Entretien","Événementiel / Prestations de services","Administration publique / OPE","ONG / Association / Fondation","Coopérative / Mutuelle","Autre"].map(s => <option key={s}>{s}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>N° RCCM</label><input placeholder="RC/DLA/2024/B/XXX" value={newClient.rccm} onChange={e => setNewClient(p => ({ ...p, rccm: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>NIU</label><input placeholder="M012345678901A" value={newClient.nif} onChange={e => setNewClient(p => ({ ...p, nif: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>N° Contribuable</label><input placeholder="P012-XXX-XXX-XXX-X" value={newClient.numero_contribuable} onChange={e => setNewClient(p => ({ ...p, numero_contribuable: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>N° Récépissé</label><input placeholder="Ex: REC/2024/XXX" value={newClient.numero_recepisse} onChange={e => setNewClient(p => ({ ...p, numero_recepisse: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={S.formGroup}><label style={S.label}>Date de création</label><input type="date" value={newClient.date_creation} onChange={e => setNewClient(p => ({ ...p, date_creation: e.target.value }))} style={S.input} /></div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a7a4a", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 10px", paddingBottom: 6, borderBottom: "2px solid #e8f5ee" }}>📍 Localisation & Coordonnées</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Région</label><select value={newClient.region} onChange={e => setNewClient(p => ({ ...p, region: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Adamaoua","Centre","Est","Extrême-Nord","Littoral","Nord","Nord-Ouest","Ouest","Sud","Sud-Ouest"].map(r => <option key={r}>{r}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Département</label><input placeholder="Ex: Mfoundi, Wouri..." value={newClient.departement} onChange={e => setNewClient(p => ({ ...p, departement: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Arrondissement / Ville</label><input placeholder="Ex: Yaoundé 1er..." value={newClient.arrondissement} onChange={e => setNewClient(p => ({ ...p, arrondissement: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>Adresse complète</label><input placeholder="Quartier, BP, Rue..." value={newClient.adresse} onChange={e => setNewClient(p => ({ ...p, adresse: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Téléphone</label><input placeholder="+237 6XX XXX XXX" value={newClient.telephone} onChange={e => setNewClient(p => ({ ...p, telephone: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>Email</label><input type="email" placeholder="contact@entreprise.cm" value={newClient.email} onChange={e => setNewClient(p => ({ ...p, email: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={S.formGroup}><label style={S.label}>Site web</label><input placeholder="www.entreprise.cm" value={newClient.site_web} onChange={e => setNewClient(p => ({ ...p, site_web: e.target.value }))} style={S.input} /></div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#8e44ad", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 10px", paddingBottom: 6, borderBottom: "2px solid #f5eefb" }}>👤 Représentant légal</div>
            <div style={S.formGroup}><label style={S.label}>Nom du dirigeant / Gérant</label><input placeholder="M. Jean DUPONT" value={newClient.dirigeant} onChange={e => setNewClient(p => ({ ...p, dirigeant: e.target.value }))} style={S.input} /></div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Tél. dirigeant</label><input placeholder="+237 6XX XXX XXX" value={newClient.tel_dirigeant} onChange={e => setNewClient(p => ({ ...p, tel_dirigeant: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>Email dirigeant</label><input type="email" placeholder="dirigeant@email.cm" value={newClient.email_dirigeant} onChange={e => setNewClient(p => ({ ...p, email_dirigeant: e.target.value }))} style={S.input} /></div>
            </div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#c17f2a", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 10px", paddingBottom: 6, borderBottom: "2px solid #fff8e6" }}>📊 Fiscalité & Comptabilité (OHADA)</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Régime fiscal</label><select value={newClient.regime_fiscal} onChange={e => setNewClient(p => ({ ...p, regime_fiscal: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Régime de l'Impôt Général Synthétique (IGS)","Régime Réel","Régime des Organisations à But Non Lucratif","Régime des Contribuables Non Professionnels"].map(r => <option key={r}>{r}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Centre des impôts</label><select value={newClient.centre_impots} onChange={e => setNewClient(p => ({ ...p, centre_impots: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["DGE (Direction des Grandes Entreprises)","CIME (Centre des Impôts des Moyennes Entreprises)","CFLP (Centre de Fiscalité Locale et des Particuliers)","CSI (Centre Spécialisé des Impôts)","CSIPL (Centre Spécialisé des Impôts des Professions Libérales)"].map(c => <option key={c}>{c}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Régime TVA</label><select value={newClient.tva} onChange={e => setNewClient(p => ({ ...p, tva: e.target.value }))} style={S.select}>{["Assujetti 19,25%","Non assujetti","Exonéré","Suspension de TVA","Partiellement assujetti"].map(r => <option key={r}>{r}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Référentiel comptable</label><select value={newClient.referentiel} onChange={e => setNewClient(p => ({ ...p, referentiel: e.target.value }))} style={S.select}>{["SYSCOHADA Révisé","SYSCOHADA","IFRS","Autre"].map(r => <option key={r}>{r}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Banque domiciliataire</label><select value={newClient.banque} onChange={e => setNewClient(p => ({ ...p, banque: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Afriland First Bank","BICEC","CCA Bank","Ecobank","Société Générale","SCB Cameroun","UBA","BGFI Bank","Atlantic Bank","NFC Bank","Autre"].map(b => <option key={b}>{b}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>N° Patente</label><input placeholder="Ex: 1234567890" value={newClient.patente} onChange={e => setNewClient(p => ({ ...p, patente: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={S.formGroup}><label style={S.label}>Date de clôture exercice</label><input placeholder="31/12" value={newClient.date_cloture} onChange={e => setNewClient(p => ({ ...p, date_cloture: e.target.value }))} style={S.input} /></div>

            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a5c9e", textTransform: "uppercase", letterSpacing: 1, margin: "16px 0 10px", paddingBottom: 6, borderBottom: "2px solid #e8f0fb" }}>🏢 Suivi cabinet</div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Responsable dossier</label><select value={newClient.responsable} onChange={e => setNewClient(p => ({ ...p, responsable: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{collaborateurs.map(c => <option key={c.id} value={c.nom}>{c.nom}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Type de mission</label><select value={newClient.type_mission} onChange={e => setNewClient(p => ({ ...p, type_mission: e.target.value }))} style={S.select}><option value="">— Choisir —</option>{["Tenue comptable SYSCOHADA","Audit légal / CAC","Audit contractuel","Conseil fiscal & juridique","Gestion de la paie","Déclarations fiscales (DSF, TVA...)","Création / Immatriculation","Assistance DGI / Contentieux","Autre"].map(m => <option key={m}>{m}</option>)}</select></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Statut</label><select value={newClient.statut} onChange={e => setNewClient(p => ({ ...p, statut: e.target.value }))} style={S.select}>{["Actif","En attente","Inactif","Suspendu"].map(s => <option key={s}>{s}</option>)}</select></div>
              <div style={S.formGroup}><label style={S.label}>Date d'entrée en relation</label><input type="date" value={newClient.date_entree} onChange={e => setNewClient(p => ({ ...p, date_entree: e.target.value }))} style={S.input} /></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
              <div style={S.formGroup}><label style={S.label}>Honoraires (FCFA/an)</label><input type="number" placeholder="500000" value={newClient.honoraires} onChange={e => setNewClient(p => ({ ...p, honoraires: e.target.value }))} style={S.input} /></div>
              <div style={S.formGroup}><label style={S.label}>CA estimé (FCFA/an)</label><input type="number" placeholder="50000000" value={newClient.ca} onChange={e => setNewClient(p => ({ ...p, ca: e.target.value }))} style={S.input} /></div>
            </div>

          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20, paddingTop: 16, borderTop: "1px solid #f0f4fa" }}>
            <button onClick={() => setShowAddClient(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={addClient} style={S.primaryBtn}>💾 Enregistrer</button>
          </div>
        </Modal>
      )}









      {/* ── APERÇU DEVIS ── */}
      {showPreview && previewDevis && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(15,39,68,.7)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 16 }}>
          <div style={{ background: "#fff", borderRadius: 16, width: "100%", maxWidth: 720, maxHeight: "90vh", overflow: "hidden", display: "flex", flexDirection: "column", boxShadow: "0 20px 60px rgba(0,0,0,.3)" }}>
            {/* Header */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "16px 24px", borderBottom: "1px solid #e2eaf4" }}>
              <span style={{ fontWeight: 700, fontSize: 15, color: "#1e3a57" }}>Aperçu du devis</span>
              <div style={{ display: "flex", gap: 10 }}>
                <button onClick={() => {
                  const printContent = document.getElementById("devis-print").innerHTML;
                  const style = `
                    <style>
                      * { box-sizing: border-box; margin: 0; padding: 0; }
                      body { font-family: 'Segoe UI', sans-serif; padding: 32px; color: #1e3a57; }
                      table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
                      th { background: #1a5c9e; color: #fff; padding: 10px 12px; font-size: 11px; text-align: left; }
                      td { padding: 10px 12px; font-size: 12px; border-bottom: 1px solid #f0f4fa; }
                      tr:nth-child(even) td { background: #f5f8fc; }
                    </style>`;
                  // Create hidden iframe
                  let iframe = document.getElementById("print-iframe");
                  if (!iframe) {
                    iframe = document.createElement("iframe");
                    iframe.id = "print-iframe";
                    iframe.style.cssText = "position:fixed;top:-9999px;left:-9999px;width:800px;height:600px;";
                    document.body.appendChild(iframe);
                  }
                  const doc = iframe.contentWindow.document;
                  doc.open();
                  doc.write(`<html><head>${style}</head><body>${printContent}</body></html>`);
                  doc.close();
                  setTimeout(() => { iframe.contentWindow.focus(); iframe.contentWindow.print(); }, 400);
                }} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 16px", borderRadius: 8, background: "#1a5c9e", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 }}>
                  🖨 Imprimer / PDF
                </button>
                <button onClick={() => setShowPreview(false)} style={{ width: 32, height: 32, borderRadius: 8, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.close} size={16} stroke="#4a6d8c" /></button>
              </div>
            </div>

            {/* Contenu imprimable */}
            <div id="devis-print" style={{ overflowY: "auto", flex: 1, padding: "32px" }}>


              {/* En-tête cabinet */}
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 32 }}>
                <div>
                  <div style={{ fontSize: 22, fontWeight: 800, color: "#1a5c9e" }}>CGA-CDA</div>
                  <div style={{ fontSize: 11, color: "#4a6d8c", fontWeight: 600, lineHeight: 1.5 }}>Centre de Gestion Agréé — Centrale Des Associés</div>
                  <div style={{ fontSize: 10, color: "#6b8aaa", lineHeight: 1.8, marginTop: 4 }}>
                    <div>NIU : M072116419497J</div>
                    <div>📞 222 29 30 14</div>
                    <div>✉ contact.cgacda@gmail.com</div>
                    <div>📍 Carrefour Artisanat, Maroua, Cameroun</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a57" }}>DEVIS</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a5c9e" }}>{previewDevis.num}</div>
                  <div style={{ fontSize: 12, color: "#6b8aaa", marginTop: 4 }}>Date : {previewDevis.date ? new Date(previewDevis.date).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR")}</div>
                </div>
              </div>

              {/* Infos client */}
              {(() => {
                const cd = clients.find(c => c.nom === previewDevis.client) || {};
                return (
                  <div style={{ background: "#f5f8fc", borderRadius: 10, padding: "16px 20px", marginBottom: 24, display: "flex", justifyContent: "space-between", gap: 16, flexWrap: "wrap" }}>
                    <div>
                      <div style={{ fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Client</div>
                      <div style={{ fontWeight: 800, fontSize: 15, color: "#1e3a57" }}>{previewDevis.client}</div>
                      {cd.forme_juridique && <div style={{ fontSize: 12, color: "#4a6d8c", fontWeight: 600 }}>{cd.forme_juridique}</div>}
                      {cd.secteur && <div style={{ fontSize: 11, color: "#6b8aaa", marginTop: 2 }}>Secteur : {cd.secteur}</div>}
                      {cd.adresse && <div style={{ fontSize: 11, color: "#6b8aaa" }}>📍 {cd.adresse}{cd.arrondissement ? ", " + cd.arrondissement : ""}{cd.region ? " — " + cd.region : ""}</div>}
                      {cd.telephone && <div style={{ fontSize: 11, color: "#6b8aaa" }}>📞 {cd.telephone}</div>}
                      {cd.email && <div style={{ fontSize: 11, color: "#6b8aaa" }}>✉ {cd.email}</div>}
                    </div>

                  </div>
                );
              })()}

              {/* Lignes */}
              <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: 24 }}>
                <thead>
                  <tr style={{ background: "#1a5c9e" }}>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "left", borderRadius: "6px 0 0 0" }}>Service</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "left" }}>Groupe</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "center" }}>Qté</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "right" }}>P.U. HT</th>
                    <th style={{ padding: "10px 12px", fontSize: 11, fontWeight: 700, color: "#fff", textAlign: "right", borderRadius: "0 6px 0 0" }}>Total HT</th>
                  </tr>
                </thead>
                <tbody>
                  {(previewDevis.lignes || []).map((l, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? "#fff" : "#f5f8fc" }}>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#1e3a57", borderBottom: "1px solid #f0f4fa" }}>{l.service || l.nom || l.mission || "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 11, color: "#6b8aaa", borderBottom: "1px solid #f0f4fa" }}>{l.groupe || "—"}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#1e3a57", textAlign: "center", borderBottom: "1px solid #f0f4fa" }}>{l.qty || 1}</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, color: "#1e3a57", textAlign: "right", borderBottom: "1px solid #f0f4fa" }}>{(l.tarif || l.prix || 0).toLocaleString("fr-FR")} FCFA</td>
                      <td style={{ padding: "10px 12px", fontSize: 12, fontWeight: 700, color: "#1a5c9e", textAlign: "right", borderBottom: "1px solid #f0f4fa" }}>{((l.tarif || l.prix || 0) * (l.qty || 1)).toLocaleString("fr-FR")} FCFA</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Totaux */}
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ width: 280 }}>
                  {[
                    ["Total HT", (previewDevis.total_ht || 0).toLocaleString("fr-FR") + " FCFA", false],
                    ["TVA (19.25%)", ((previewDevis.total_ht || 0) * 0.1925).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " FCFA", false],
                    ["Total TTC", ((previewDevis.total_ht || 0) * 1.1925).toLocaleString("fr-FR", { maximumFractionDigits: 0 }) + " FCFA", true],
                  ].map(([label, val, bold]) => (
                    <div key={label} style={{ display: "flex", justifyContent: "space-between", padding: bold ? "12px 0 0" : "6px 0", borderTop: bold ? "2px solid #1a5c9e" : "none", marginTop: bold ? 8 : 0 }}>
                      <span style={{ fontSize: bold ? 15 : 13, fontWeight: bold ? 700 : 400, color: bold ? "#1e3a57" : "#6b8aaa" }}>{label}</span>
                      <span style={{ fontSize: bold ? 17 : 13, fontWeight: bold ? 800 : 600, color: bold ? "#1a5c9e" : "#1e3a57" }}>{val}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Pied de page */}
              <div style={{ marginTop: 40, paddingTop: 16, borderTop: "1px solid #e2eaf4", fontSize: 11, color: "#8da4c0", textAlign: "center" }}>
CGA-CDA — Centre de Gestion Agréé | NIU : M072116419497J<br/>
                Carrefour Artisanat, Maroua, Cameroun | Tél : 222 29 30 14 | contact.cgacda@gmail.com<br/>
                Devis valable 30 jours à compter de la date d&apos;émission
              </div>
            </div>
          </div>
        </div>
      )}




      {/* MODAL VISUALISATION ABONNEMENT */}
      {viewAbo && (
        <Modal title="Détail abonnement" onClose={() => setViewAbo(null)}>
          <div style={{ display: "flex", alignItems: "center", gap: 14, padding: "14px 16px", borderRadius: 12, background: "linear-gradient(135deg,#e8f0fb,#f0f6ff)", marginBottom: 16 }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 22 }}>🔄</div>
            <div>
              <div style={{ fontSize: 16, fontWeight: 800, color: "#1e3a57" }}>{viewAbo.client}</div>
              <span style={{ fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 20, background: viewAbo.statut === "Actif" ? "#e8f5ee" : viewAbo.statut === "Suspendu" ? "#fff8e6" : "#fff0f0", color: viewAbo.statut === "Actif" ? "#1a7a4a" : viewAbo.statut === "Suspendu" ? "#c17f2a" : "#c0392b" }}>{viewAbo.statut}</span>
            </div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 14 }}>
            {[
              { label: "Montant", value: viewAbo.montant ? Number(viewAbo.montant).toLocaleString("fr-FR") + " FCFA" : "—" },
              { label: "Fréquence", value: viewAbo.frequence || "—" },
              { label: "Date de début", value: viewAbo.date_debut ? new Date(viewAbo.date_debut).toLocaleDateString("fr-FR") : "—" },
              { label: "Prochaine échéance", value: viewAbo.prochaine_echeance ? new Date(viewAbo.prochaine_echeance).toLocaleDateString("fr-FR") : "—" },
            ].map((f, i) => (
              <div key={i} style={{ background: "#f5f8fc", borderRadius: 8, padding: "8px 12px" }}>
                <div style={{ fontSize: 10, color: "#8da4c0", fontWeight: 600 }}>{f.label}</div>
                <div style={{ fontSize: 13, color: "#1e3a57", fontWeight: 700, marginTop: 2 }}>{f.value}</div>
              </div>
            ))}
          </div>
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1a5c9e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 8 }}>Services souscrits</div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {(viewAbo.service || "").split(", ").filter(Boolean).map((s, i) => (
                <span key={i} style={{ fontSize: 12, padding: "4px 10px", borderRadius: 20, background: "#e8f0fb", color: "#1a5c9e", fontWeight: 600 }}>{s}</span>
              ))}
              {!viewAbo.service && <span style={{ fontSize: 12, color: "#8da4c0" }}>Aucun service</span>}
            </div>
          </div>
          {viewAbo.note && (
            <div style={{ padding: "10px 14px", borderRadius: 9, background: "#f5f8fc", fontSize: 13, color: "#4a6d8c", fontStyle: "italic", marginBottom: 14 }}>
              📝 {viewAbo.note}
            </div>
          )}
          <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
            <button onClick={() => setViewAbo(null)} style={{ padding: "9px 20px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Fermer</button>
          </div>
        </Modal>
      )}

      {showAddAbo && (
        <Modal title="Nouvel abonnement" onClose={() => setShowAddAbo(false)}>
          <div style={S.formGroup}>
            <label style={S.label}>Client *</label>
            <select value={newAbo.client} onChange={e => setNewAbo(p => ({ ...p, client: e.target.value }))} style={S.select}>
              {clients.map(c => <option key={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Services souscrits * <span style={{ color: "#8da4c0", fontWeight: 400 }}>({newAbo.services?.length || 0} sélectionné(s))</span></label>
            <div style={{ border: "1.5px solid #87CEEB", borderRadius: 8, padding: "8px 10px", maxHeight: 200, overflowY: "auto", background: "#fff" }}>
              {["Assistance Comptable","Assistance Fiscale","Assistance Sociale","Assistance Juridique"].map(g => {
                const srvs = services.filter(s => s.groupe === g);
                if (!srvs.length) return null;
                return (
                  <div key={g} style={{ marginBottom: 8 }}>
                    <div style={{ fontSize: 10, fontWeight: 800, color: "#1a5c9e", textTransform: "uppercase", letterSpacing: 0.5, marginBottom: 4 }}>{g}</div>
                    {srvs.map(s => (
                      <label key={s.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "4px 6px", borderRadius: 6, cursor: "pointer", background: newAbo.services?.includes(s.nom) ? "#e8f0fb" : "transparent" }}>
                        <input type="checkbox"
                          checked={newAbo.services?.includes(s.nom) || false}
                          onChange={e => {
                            const updated = e.target.checked
                              ? [...(newAbo.services || []), s.nom]
                              : (newAbo.services || []).filter(n => n !== s.nom);
                            setNewAbo(p => ({ ...p, services: updated }));
                          }}
                          style={{ accentColor: "#1a5c9e", width: 14, height: 14 }} />
                        <span style={{ fontSize: 12, color: "#1e3a57" }}>{s.nom}</span>
                      </label>
                    ))}
                  </div>
                );
              })}
              {services.length === 0 && <div style={{ fontSize: 12, color: "#8da4c0", textAlign: "center", padding: 8 }}>Aucun service disponible</div>}
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Montant (FCFA) *</label>
              <input type="number" placeholder="0" value={newAbo.montant} onChange={e => setNewAbo(p => ({ ...p, montant: e.target.value }))} style={S.input} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Fréquence</label>
              <select value={newAbo.frequence} onChange={e => setNewAbo(p => ({ ...p, frequence: e.target.value }))} style={S.select}>
                {["Mensuel","Trimestriel","Semestriel","Annuel"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Date de début</label>
            <input type="date" value={newAbo.date_debut} onChange={e => setNewAbo(p => ({ ...p, date_debut: e.target.value }))} style={S.input} />
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Statut</label>
            <select value={newAbo.statut} onChange={e => setNewAbo(p => ({ ...p, statut: e.target.value }))} style={S.select}>
              {["Actif","Suspendu","Résilié"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Note (optionnel)</label>
            <input placeholder="Précision sur l'abonnement..." value={newAbo.note} onChange={e => setNewAbo(p => ({ ...p, note: e.target.value }))} style={S.input} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowAddAbo(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={addAbonnement} style={S.primaryBtn}>Enregistrer</button>
          </div>
        </Modal>
      )}





      {showAddService && (
        <Modal title="Nouveau service" onClose={() => setShowAddService(false)}>
          <div style={S.formGroup}>
            <label style={S.label}>Groupe *</label>
            <select value={newService.groupe} onChange={e => setNewService(p => ({ ...p, groupe: e.target.value }))} style={S.select}>
              {["Assistance Comptable", "Assistance Fiscale", "Assistance Sociale", "Assistance Juridique"].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Nom du service *</label>
            <input placeholder="Ex: Conseil en gestion..." value={newService.nom} onChange={e => setNewService(p => ({ ...p, nom: e.target.value }))} style={S.input} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Tarif (FCFA)</label>
              <input type="number" placeholder="0" value={newService.tarif} onChange={e => setNewService(p => ({ ...p, tarif: e.target.value }))} style={S.input} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Unité</label>
              <select value={newService.unite} onChange={e => setNewService(p => ({ ...p, unite: e.target.value }))} style={S.select}>
                {["forfait", "mois", "an", "heure", "acte", "dossier"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowAddService(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={addService} style={S.primaryBtn}>Enregistrer</button>
          </div>
        </Modal>
      )}

      {showEditService && editService && (
        <Modal title="Modifier le service" onClose={() => { setShowEditService(false); setEditService(null); }}>
          <div style={S.formGroup}>
            <label style={S.label}>Groupe</label>
            <select value={editService.groupe} onChange={e => setEditService(p => ({ ...p, groupe: e.target.value }))} style={S.select}>
              {["Assistance Comptable", "Assistance Fiscale", "Assistance Sociale", "Assistance Juridique"].map(g => <option key={g}>{g}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Nom du service</label>
            <input value={editService.nom} onChange={e => setEditService(p => ({ ...p, nom: e.target.value }))} style={S.input} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Tarif (FCFA)</label>
              <input type="number" placeholder="0" value={editService.tarif || ""} onChange={e => setEditService(p => ({ ...p, tarif: e.target.value }))} style={S.input} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Unité</label>
              <select value={editService.unite || "forfait"} onChange={e => setEditService(p => ({ ...p, unite: e.target.value }))} style={S.select}>
                {["forfait", "mois", "an", "heure", "acte", "dossier"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => { setShowEditService(false); setEditService(null); }} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={updateService} style={S.primaryBtn}>Enregistrer</button>
          </div>
        </Modal>
      )}


      {showAddDepense && (
        <Modal title="Nouvelle dépense" onClose={() => setShowAddDepense(false)}>
          <div style={S.formGroup}>
            <label style={S.label}>Libellé *</label>
            <input placeholder="Ex: Achat papier, Loyer bureau..." value={newDepense.libelle} onChange={e => setNewDepense(p => ({ ...p, libelle: e.target.value }))} style={S.input} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Montant (FCFA) *</label>
              <input type="number" placeholder="0" value={newDepense.montant} onChange={e => setNewDepense(p => ({ ...p, montant: e.target.value }))} style={S.input} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Date</label>
              <input type="date" value={newDepense.date} onChange={e => setNewDepense(p => ({ ...p, date: e.target.value }))} style={S.select} />
            </div>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Catégorie</label>
            <select value={newDepense.categorie} onChange={e => setNewDepense(p => ({ ...p, categorie: e.target.value }))} style={S.select}>
              {["Fournitures", "Loyer", "Salaires", "Transport", "Informatique", "Communication", "Honoraires", "Autres"].map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Note (optionnel)</label>
            <input placeholder="Précision sur la dépense..." value={newDepense.note} onChange={e => setNewDepense(p => ({ ...p, note: e.target.value }))} style={S.input} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowAddDepense(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={addDepense} style={S.primaryBtn}>Enregistrer</button>
          </div>
        </Modal>
      )}


    </div>
  );
}

const S = {
  card: { background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,30,80,.06)" },
  cardHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#1e3a57" },
  empty: { fontSize: 13, color: "#8da4c0", padding: "12px 0", textAlign: "center" },
  primaryBtn: { display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, background: "#1a5c9e", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: 6 },
  formGroup: { flex: 1, display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 600, color: "#4a6d8c" },
  input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #87CEEB", fontSize: 13, color: "#1e3a57", background: "#ffffff", outline: "none", fontFamily: "inherit" },
  select: { padding: "9px 12px", borderRadius: 8, border: "1px solid #87CEEB", fontSize: 13, color: "#1e3a57", background: "#ffffff", outline: "none" },
  overlay: { position: "fixed", inset: 0, background: "rgba(15,39,68,.5)", display: "flex", alignItems: "flex-start", justifyContent: "center", zIndex: 1000, overflowY: "auto", padding: "20px 12px" },
  modal: { background: "#fff", borderRadius: 16, padding: "24px 28px", width: "min(520px, 95vw)", maxWidth: "95vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)", overflowX: "hidden", boxSizing: "border-box", margin: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 700, color: "#1e3a57" },
};
