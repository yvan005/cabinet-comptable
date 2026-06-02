import { useState, useEffect, useCallback } from "react";

// ── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://egnhdnuquirsngwokwmy.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVnbmhkbnVxdWlyc25nd29rd215Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzNjc2NjEsImV4cCI6MjA5NDk0MzY2MX0.bt-hct6Ke5g1GuxdMgkRl23-RUersCVD2_mkpuIX4i0";

const db = {
  async get(table, params = "") {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc${params}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${SUPABASE_KEY}` }
    });
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
  settings:  "M12 15a3 3 0 100-6 3 3 0 000 6z M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z",
};

const MISSIONS = [
  { label: "Tenue comptable mensuelle", prix: 98000, unite: "mois" },
  { label: "Révision annuelle des comptes", prix: 520000, unite: "an" },
  { label: "Établissement bilan & liasse", prix: 780000, unite: "an" },
  { label: "Déclaration IS", prix: 260000, unite: "an" },
  { label: "Gestion paie (par salarié)", prix: 32500, unite: "mois/salarié" },
  { label: "Conseil juridique ponctuel", prix: 130000, unite: "heure" },
  { label: "Accompagnement création société", prix: 975000, unite: "forfait" },
  { label: "Audit et diagnostic comptable", prix: 1625000, unite: "forfait" },
];

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
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("Tous");

  const [clients, setClients] = useState([]);
  const [echeances, setEcheances] = useState([]);
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddEcheance, setShowAddEcheance] = useState(false);


  const [devisLines, setDevisLines] = useState([{ mission: MISSIONS[0], qty: 1 }]);
  const [devisClient, setDevisClient] = useState("");
  const [devisDate, setDevisDate] = useState(new Date().toISOString().split("T")[0]);
  const [devisSaving, setDevisSaving] = useState(false);
  const [depenses, setDepenses] = useState([]);
  const [showAddDepense, setShowAddDepense] = useState(false);
  const [newDepense, setNewDepense] = useState({ libelle: "", montant: "", categorie: "Fournitures", date: new Date().toISOString().split("T")[0], note: "" });
  const [depensePeriode, setDepensePeriode] = useState("jour");
  const [services, setServices] = useState([]);
  const [showAddService, setShowAddService] = useState(false);
  const [newService, setNewService] = useState({ nom: "", description: "", tarif: "", unite: "forfait", categorie: "Comptabilité", actif: true });

  const [newClient, setNewClient] = useState({ nom: "", secteur: "", statut: "Actif", responsable: "", ca: "" });
  const [newEch, setNewEch] = useState({ label: "", date: "", type: "TVA", urgence: "normale", client: "" });

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [c, e, d, dep, srv] = await Promise.all([
      db.get("clients"), db.get("echeances"), db.get("devis"), db.get("depenses"), db.get("services"),
    ]);
    setClients(Array.isArray(c) ? c : []);
    setEcheances(Array.isArray(e) ? e : []);
    setDevisList(Array.isArray(d) ? d : []);
    setDepenses(Array.isArray(dep) ? dep : []);
    setServices(Array.isArray(srv) ? srv : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);
  useEffect(() => { if (clients.length > 0 && !devisClient) setDevisClient(clients[0]?.nom || ""); }, [clients]);

  const navigate = (p) => { setPage(p); setSidebarOpen(false); };

  // CLIENTS
  const addClient = async () => {
    if (!newClient.nom) return;
    await db.post("clients", newClient);
    setNewClient({ nom: "", secteur: "", statut: "Actif", responsable: "", ca: "" });
    setShowAddClient(false); loadAll();
  };
  const deleteClient = async (id) => { await db.delete("clients", id); loadAll(); };

  // ÉCHÉANCES
  const addEcheance = async () => {
    if (!newEch.label || !newEch.date) return;
    await db.post("echeances", { ...newEch, fait: false });
    setNewEch({ label: "", date: "", type: "TVA", urgence: "normale", client: "" });
    setShowAddEcheance(false); loadAll();
  };
  const toggleFait = async (e) => { await db.patch("echeances", e.id, { fait: !e.fait }); loadAll(); };
  const deleteEch = async (id) => { await db.delete("echeances", id); loadAll(); };

  // MESSAGES

  // SERVICES
  const addService = async () => {
    if (!newService.nom || !newService.tarif) return;
    await db.post("services", { ...newService, tarif: parseFloat(newService.tarif) });
    setNewService({ nom: "", description: "", tarif: "", unite: "forfait", categorie: "Comptabilité", actif: true });
    setShowAddService(false); loadAll();
  };
  const toggleServiceActif = async (s) => { await db.patch("services", s.id, { actif: !s.actif }); loadAll(); };
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
  const totalHT = devisLines.reduce((s, l) => s + l.mission.prix * l.qty, 0);
  const totalTTC = totalHT * 1.2;
  const addLine = () => setDevisLines(l => [...l, { mission: MISSIONS[0], qty: 1 }]);
  const removeLine = (i) => setDevisLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) => setDevisLines(l => l.map((ln, idx) => idx === i ? { ...ln, [field]: val } : ln));
  const saveDevis = async (statut) => {
    setDevisSaving(true);
    await db.post("devis", { client: devisClient, date: devisDate, lignes: devisLines.map(l => ({ mission: l.mission.label, prix: l.mission.prix, qty: l.qty })), total_ht: totalHT, total_ttc: totalTTC, statut });
    setDevisSaving(false); await loadAll();
    alert(`Devis ${statut === "Brouillon" ? "enregistré" : "envoyé"} avec succès !`);
  };

  const urgentEch = echeances.filter(e => e.urgence === "haute" && !e.fait);
  const filteredClients = clients.filter(c => {
    const matchF = clientFilter === "Tous" || c.statut === clientFilter;
    const matchS = c.nom?.toLowerCase().includes(searchQuery.toLowerCase()) || c.secteur?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchF && matchS;
  });

  const kpis = [
    { label: "Clients actifs", value: clients.filter(c => c.statut === "Actif").length, delta: `${clients.length} au total`, color: "#1a5c9e", icon: ic.clients },
    { label: "Échéances", value: echeances.filter(e => !e.fait).length, delta: `${urgentEch.length} urgentes`, color: "#c17f2a", icon: ic.calendar },
    { label: "Devis", value: devisList.length, delta: `${devisList.filter(d => d.statut === "Envoyé").length} envoyés`, color: "#1a7a4a", icon: ic.devis },
  ];

  const navItems = [
    { id: "dashboard", label: "Tableau de bord", icon: ic.dashboard },
    { id: "clients",   label: "Clients",          icon: ic.clients },
    { id: "echeances", label: "Échéances",        icon: ic.calendar },
    { id: "devis",     label: "Devis",            icon: ic.devis },
    { id: "rapports",  label: "Rapports",         icon: ic.rapports },
    { id: "collab",    label: "Collaborateurs",   icon: ic.collab },
    { id: "documents", label: "Documents",        icon: ic.docs },
    { id: "services",  label: "Services",         icon: ic.service },
    { id: "depenses",  label: "Dépenses",         icon: ic.depenses },
    { id: "settings",  label: "Paramètres",       icon: ic.settings },
  ];

  const pageTitle = { dashboard: "Tableau de bord", clients: "Clients", echeances: "Échéances", devis: "Devis", rapports: "Rapports", collab: "Collaborateurs", documents: "Documents", services: "Services", depenses: "Dépenses", settings: "Paramètres" }[page];

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
          <div style={{ width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 }}>EC</div>
          <div>
            <div style={{ color: "#e2eaf4", fontWeight: 800, fontSize: 15 }}>CGA-CDA</div>
            <div style={{ color: "#4a6d8c", fontSize: 9, lineHeight: 1.3 }}>Centrale des Associés -<br/>Conseils & Expertise<br/>Comptable et Fiscale</div>
          </div>
        </div>
        <nav style={{ display: "flex", flexDirection: "column", gap: 2, padding: "0 12px", flex: 1 }}>
          {navItems.map(item => (
            <button key={item.id} onClick={() => navigate(item.id)} className="nav-hover" style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 12px", borderRadius: 9, background: page === item.id ? "linear-gradient(135deg,#2e7fcf,#1a5c9e)" : "none", border: "none", cursor: "pointer", color: page === item.id ? "#fff" : "#8da4c0", fontSize: 13, fontWeight: page === item.id ? 600 : 500, textAlign: "left", width: "100%" }}>
              <Icon d={item.icon} size={17} stroke={page === item.id ? "#fff" : "#8da4c0"} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && <span style={{ background: "#c0392b", color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px" }}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 0", borderTop: "1px solid #1a3558" }}>
          <div style={{ width: 36, height: 36, borderRadius: "50%", background: "#1a5c9e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 }}>PW</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2eaf4" }}>Pierre WILLA SOUMAI</div>
            <div style={{ fontSize: 11, color: "#6b8aaa" }}>Expert-comptable</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0, overflow: "hidden", ...(isMobile ? { width: "100%" } : {}) }}>

        {/* TOPBAR */}
        <header style={{ background: "#fff", borderBottom: "1px solid #e2eaf4", padding: isMobile ? "0 16px" : "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0, gap: 12 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            {isMobile && (
              <button onClick={() => setSidebarOpen(true)} style={{ background: "none", border: "none", cursor: "pointer", padding: 4 }}>
                <Icon d={ic.menu} size={22} stroke="#1e3a57" />
              </button>
            )}
            <div style={{ fontSize: isMobile ? 15 : 17, fontWeight: 700, color: "#1e3a57" }}>{pageTitle}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            
            <button onClick={loadAll} style={{ background: "#f5f8fc", border: "1px solid #e2eaf4", borderRadius: 8, padding: "7px 10px", cursor: "pointer", fontSize: 12, color: "#4a6d8c" }}>↻</button>
            <div style={{ width: 34, height: 34, borderRadius: "50%", background: "#1a5c9e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, cursor: "pointer" }}>PW</div>
          </div>
        </header>

        {/* CONTENT */}
        <div style={{ padding: isMobile ? 14 : 24, overflowY: "auto", flex: 1 }}>
          {loading ? <Spinner /> : <>

            {/* ── DASHBOARD ── */}
            {page === "dashboard" && (
              <div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: isMobile ? 10 : 14, marginBottom: 16 }}>
                  {kpis.map((k, i) => (
                    <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: isMobile ? "14px" : "18px 20px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 9, background: k.color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                        <Icon d={k.icon} size={18} stroke={k.color} />
                      </div>
                      <div style={{ fontSize: isMobile ? 22 : 26, fontWeight: 800, color: "#1e3a57", lineHeight: 1.1 }}>{k.value}</div>
                      <div style={{ fontSize: isMobile ? 11 : 12, color: "#6b8aaa", fontWeight: 500 }}>{k.label}</div>
                      <div style={{ fontSize: 11, color: "#8da4c0" }}>{k.delta}</div>
                    </div>
                  ))}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14 }}>
                  <div className="card-hover" style={S.card}>
                    <div style={S.cardHeader}><Icon d={ic.alert} size={16} stroke="#c0392b" /><span style={S.cardTitle}>Échéances urgentes</span></div>
                    {urgentEch.length === 0 && <div style={S.empty}>Aucune échéance urgente 🎉</div>}
                    {urgentEch.slice(0, 4).map(e => (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 0", borderBottom: "1px solid #f0f4fa", flexWrap: "wrap" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: "#fff0f0", color: "#c0392b", flexShrink: 0 }}>{e.type}</div>
                        <div style={{ flex: 1, minWidth: 100 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a57" }}>{e.label}</div>
                          <div style={{ fontSize: 11, color: "#8da4c0" }}>{e.client}</div>
                        </div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: "#4a6d8c" }}>{new Date(e.date).toLocaleDateString("fr-FR")}</div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

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
                    <button onClick={() => setShowAddClient(true)} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Nouveau</button>
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
                          <button onClick={() => deleteClient(c.id)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={14} stroke="#c0392b" /></button>
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
                        <div style={{ flex: 0.5, textAlign: "center" }}>
                          <button onClick={() => deleteClient(c.id)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto" }}><Icon d={ic.trash} size={14} stroke="#c0392b" /></button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── ÉCHÉANCES ── */}
            {page === "echeances" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                  <button onClick={() => setShowAddEcheance(true)} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Nouvelle</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 10, marginBottom: 16 }}>
                  {[
                    { label: "Haute priorité", count: echeances.filter(e => e.urgence === "haute" && !e.fait).length, color: "#c0392b", bg: "#fff0f0" },
                    { label: "Priorité moyenne", count: echeances.filter(e => e.urgence === "moyenne" && !e.fait).length, color: "#c17f2a", bg: "#fff8e6" },
                    { label: "Terminées", count: echeances.filter(e => e.fait).length, color: "#1a7a4a", bg: "#e8f5ee" },
                  ].map((s, i) => (
                    <div key={i} style={{ ...S.card, flexDirection: "row", alignItems: "center", gap: 14, padding: "14px 18px" }}>
                      <div style={{ width: 40, height: 40, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: s.color, flexShrink: 0 }}>{s.count}</div>
                      <span style={{ fontSize: 13, color: "#4a6d8c", fontWeight: 500 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div className="card-hover" style={S.card}>
                  {echeances.length === 0 && <div style={S.empty}>Aucune échéance enregistrée</div>}
                  {[...echeances].sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => {
                    const uc = { haute: { bg: "#fff0f0", dot: "#c0392b" }, moyenne: { bg: "#fff8e6", dot: "#c17f2a" }, normale: { bg: "#e8f5ee", dot: "#1a7a4a" } }[e.urgence] || { bg: "#f5f5f5", dot: "#888" };
                    const daysLeft = Math.round((new Date(e.date) - new Date()) / 86400000);
                    return (
                      <div key={e.id} style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12, padding: "12px 0", borderBottom: "1px solid #f0f4fa", opacity: e.fait ? 0.5 : 1, flexWrap: isMobile ? "wrap" : "nowrap" }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: uc.dot, flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: isMobile ? "60%" : "auto" }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a57", textDecoration: e.fait ? "line-through" : "none" }}>{e.label}</div>
                          <div style={{ fontSize: 11, color: "#6b8aaa" }}>{e.client}</div>
                        </div>
                        <div style={{ fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, background: uc.bg, color: uc.dot, flexShrink: 0 }}>{e.type}</div>
                        <div style={{ textAlign: "right", minWidth: 80, flexShrink: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{new Date(e.date).toLocaleDateString("fr-FR")}</div>
                          <div style={{ fontSize: 11, color: daysLeft <= 5 ? "#c0392b" : "#6b8aaa" }}>{e.fait ? "✓ Fait" : daysLeft <= 0 ? "Dépassée" : `J-${daysLeft}`}</div>
                        </div>
                        <button onClick={() => toggleFait(e)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={ic.check} size={14} stroke="#1a7a4a" /></button>
                        <button onClick={() => deleteEch(e.id)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* ── DEVIS ── */}
            {page === "devis" && (
              <div style={{ maxWidth: 780 }}>
                <div className="card-hover" style={S.card}>
                  <div style={S.cardHeader}><Icon d={ic.devis} size={16} stroke="#1a5c9e" /><span style={S.cardTitle}>Simuler un devis</span></div>
                  <div style={{ display: "flex", gap: 12, marginBottom: 16, flexDirection: isMobile ? "column" : "row" }}>
                    <div style={S.formGroup}>
                      <label style={S.label}>Client</label>
                      <select value={devisClient} onChange={e => setDevisClient(e.target.value)} style={S.select}>
                        {clients.map(c => <option key={c.id}>{c.nom}</option>)}
                      </select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Date</label>
                      <input type="date" value={devisDate} onChange={e => setDevisDate(e.target.value)} style={S.select} />
                    </div>
                  </div>
                  {devisLines.map((line, i) => (
                    <div key={i} style={{ display: "flex", gap: 8, alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f4fa", flexWrap: isMobile ? "wrap" : "nowrap" }}>
                      <div style={{ flex: isMobile ? "1 1 100%" : 3 }}>
                        <select value={line.mission.label} onChange={e => updateLine(i, "mission", MISSIONS.find(m => m.label === e.target.value))} style={{ ...S.select, width: "100%" }}>
                          {MISSIONS.map(m => <option key={m.label}>{m.label}</option>)}
                        </select>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <input type="number" min={1} value={line.qty} onChange={e => updateLine(i, "qty", parseInt(e.target.value) || 1)} style={{ ...S.select, width: 60, textAlign: "center" }} />
                      </div>
                      <div style={{ fontWeight: 700, fontSize: 14, color: "#1a5c9e", minWidth: 80, textAlign: "right" }}>{(line.mission.prix * line.qty).toLocaleString("fr-FR")} FCFA</div>
                      <button onClick={() => removeLine(i)} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #e2eaf4", background: "#fff", cursor: "pointer", color: "#c0392b", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>×</button>
                    </div>
                  ))}
                  <button onClick={addLine} style={{ display: "flex", alignItems: "center", gap: 7, padding: "8px 0", background: "none", border: "none", cursor: "pointer", color: "#1a5c9e", fontSize: 13, fontWeight: 600, marginTop: 8 }}><Icon d={ic.plus} size={14} stroke="#1a5c9e" /> Ajouter une ligne</button>
                  <div style={{ background: "#f5f8fc", borderRadius: 10, padding: "16px 20px", marginTop: 16 }}>
                    {[["Total HT", `${totalHT.toLocaleString("fr-FR")} FCFA`], ["TVA (20%)", `${(totalHT * 0.2).toLocaleString("fr-FR")} FCFA`]].map(([k, v]) => (
                      <div key={k} style={{ display: "flex", justifyContent: "space-between", fontSize: 14, color: "#1e3a57", marginBottom: 8 }}>
                        <span style={{ color: "#6b8aaa" }}>{k}</span><span style={{ fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                    <div style={{ display: "flex", justifyContent: "space-between", borderTop: "2px solid #1a5c9e", paddingTop: 12, marginTop: 4 }}>
                      <span style={{ fontWeight: 700, fontSize: 16, color: "#1e3a57" }}>Total TTC</span>
                      <span style={{ fontWeight: 800, fontSize: 20, color: "#1a5c9e" }}>{totalTTC.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} FCFA</span>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16, flexWrap: "wrap" }}>
                    <button onClick={() => saveDevis("Brouillon")} disabled={devisSaving} style={{ display: "flex", alignItems: "center", gap: 7, padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>{devisSaving ? "…" : "Brouillon"}</button>
                    <button onClick={() => saveDevis("Envoyé")} disabled={devisSaving} style={S.primaryBtn}><Icon d={ic.send} size={14} stroke="#fff" />{devisSaving ? "…" : "Envoyer"}</button>
                  </div>
                </div>
                {devisList.length > 0 && (
                  <div style={{ ...S.card, marginTop: 14 }}>
                    <div style={S.cardHeader}><Icon d={ic.folder} size={16} stroke="#4a6d8c" /><span style={S.cardTitle}>Historique des devis</span></div>
                    {devisList.map(d => (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "12px 0", borderBottom: "1px solid #f0f4fa", flexWrap: "wrap" }}>
                        <div style={{ flex: 2 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a57" }}>{d.client}</div>
                          <div style={{ fontSize: 11, color: "#8da4c0" }}>{d.date ? new Date(d.date).toLocaleDateString("fr-FR") : "—"}</div>
                        </div>
                        <div style={{ fontWeight: 700, fontSize: 14, color: "#1a5c9e" }}>{d.total_ttc?.toLocaleString("fr-FR")} FCFA TTC</div>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20, background: d.statut === "Envoyé" ? "#e8f5ee" : "#f5f8fc", color: d.statut === "Envoyé" ? "#1a7a4a" : "#6b8aaa" }}>{d.statut}</span>
                        <button onClick={() => db.delete("devis", d.id).then(loadAll)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ── RAPPORTS ── */}
            {page === "rapports" && (() => {
              const now = new Date();
              const annee = now.getFullYear();
              const moisNoms = ["Jan","Fév","Mar","Avr","Mai","Juin","Juil","Aoû","Sep","Oct","Nov","Déc"];

              // Dépenses par mois (année courante)
              const depMois = Array(12).fill(0);
              depenses.forEach(d => {
                const date = new Date(d.date);
                if (date.getFullYear() === annee) depMois[date.getMonth()] += d.montant || 0;
              });
              const maxDep = Math.max(...depMois, 1);

              // Dépenses par catégorie (année courante)
              const cats = {};
              depenses.forEach(d => {
                if (new Date(d.date).getFullYear() === annee) {
                  cats[d.categorie] = (cats[d.categorie] || 0) + (d.montant || 0);
                }
              });
              const catColors = { Fournitures: "#1a5c9e", Loyer: "#1a7a4a", Salaires: "#c17f2a", Transport: "#8e44ad", Informatique: "#c0392b", Communication: "#2980b9", Honoraires: "#e67e22", Autres: "#7f8c8d" };

              // KPIs
              const totalAnnee = depenses.filter(d => new Date(d.date).getFullYear() === annee).reduce((s, d) => s + (d.montant || 0), 0);
              const totalMois = depenses.filter(d => { const dt = new Date(d.date); return dt.getFullYear() === annee && dt.getMonth() === now.getMonth(); }).reduce((s, d) => s + (d.montant || 0), 0);
              const totalJour = depenses.filter(d => new Date(d.date).toDateString() === now.toDateString()).reduce((s, d) => s + (d.montant || 0), 0);
              const topCat = Object.entries(cats).sort((a, b) => b[1] - a[1])[0];

              return (
                <div>
                  {/* KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 16 }}>
                    {[
                      { label: "Dépenses aujourd'hui", value: totalJour.toLocaleString("fr-FR") + " FCFA", color: "#c0392b", icon: ic.depenses },
                      { label: "Dépenses ce mois", value: totalMois.toLocaleString("fr-FR") + " FCFA", color: "#c17f2a", icon: ic.depenses },
                      { label: "Dépenses cette année", value: totalAnnee.toLocaleString("fr-FR") + " FCFA", color: "#1a5c9e", icon: ic.depenses },
                      { label: "Catégorie principale", value: topCat ? topCat[0] : "—", color: "#1a7a4a", icon: ic.trend },
                    ].map((k, i) => (
                      <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: isMobile ? "12px" : "16px 18px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", display: "flex", flexDirection: "column", gap: 4 }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: k.color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                          <Icon d={k.icon} size={16} stroke={k.color} />
                        </div>
                        <div style={{ fontSize: isMobile ? 13 : 16, fontWeight: 800, color: "#1e3a57", lineHeight: 1.2 }}>{k.value}</div>
                        <div style={{ fontSize: 11, color: "#6b8aaa" }}>{k.label}</div>
                      </div>
                    ))}
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 16, marginBottom: 16 }}>
                    {/* Dépenses par mois */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}><Icon d={ic.rapports} size={16} stroke="#1a5c9e" /><span style={S.cardTitle}>Dépenses par mois ({annee})</span></div>
                      {depenses.length === 0 ? <div style={S.empty}>Aucune dépense enregistrée</div> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                          {depMois.map((val, i) => (
                            <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 32, fontSize: 11, color: "#6b8aaa", flexShrink: 0 }}>{moisNoms[i]}</div>
                              <div style={{ flex: 1, height: 8, background: "#f0f4fa", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${(val/maxDep)*100}%`, height: "100%", background: "linear-gradient(90deg,#c0392b,#e74c3c)", borderRadius: 4, transition: "width 0.5s ease" }} />
                              </div>
                              <div style={{ width: 110, fontSize: 11, fontWeight: 700, color: "#1e3a57", textAlign: "right" }}>{val.toLocaleString("fr-FR")} FCFA</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* Dépenses par catégorie */}
                    <div className="card-hover" style={S.card}>
                      <div style={S.cardHeader}><Icon d={ic.trend} size={16} stroke="#c17f2a" /><span style={S.cardTitle}>Répartition par catégorie</span></div>
                      {Object.keys(cats).length === 0 ? <div style={S.empty}>Aucune dépense cette année</div> : (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {Object.entries(cats).sort((a,b) => b[1]-a[1]).map(([cat, montant]) => (
                            <div key={cat} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 90, fontSize: 11, color: "#4a6d8c", flexShrink: 0 }}>{cat}</div>
                              <div style={{ flex: 1, height: 8, background: "#f0f4fa", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${totalAnnee ? (montant/totalAnnee*100) : 0}%`, height: "100%", background: catColors[cat] || "#888", borderRadius: 4 }} />
                              </div>
                              <div style={{ width: 110, fontSize: 11, fontWeight: 700, color: "#1e3a57", textAlign: "right" }}>{montant.toLocaleString("fr-FR")} FCFA</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Clients par secteur (dynamique) */}
                  <div className="card-hover" style={S.card}>
                    <div style={S.cardHeader}><Icon d={ic.clients} size={16} stroke="#1a7a4a" /><span style={S.cardTitle}>Clients par secteur</span></div>
                    {clients.length === 0 ? <div style={S.empty}>Aucun client enregistré</div> : (() => {
                      const secteurs = {};
                      clients.forEach(c => { secteurs[c.secteur || "Autre"] = (secteurs[c.secteur || "Autre"] || 0) + 1; });
                      const maxS = Math.max(...Object.values(secteurs), 1);
                      const sColors = ["#1a5c9e","#1a7a4a","#c17f2a","#8e44ad","#c0392b","#2980b9","#e67e22","#7f8c8d"];
                      return (
                        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                          {Object.entries(secteurs).sort((a,b) => b[1]-a[1]).map(([s, n], i) => (
                            <div key={s} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                              <div style={{ width: 90, fontSize: 12, color: "#4a6d8c", flexShrink: 0 }}>{s}</div>
                              <div style={{ flex: 1, height: 8, background: "#f0f4fa", borderRadius: 4, overflow: "hidden" }}>
                                <div style={{ width: `${(n/maxS)*100}%`, height: "100%", background: sColors[i % sColors.length], borderRadius: 4 }} />
                              </div>
                              <div style={{ width: 24, fontSize: 12, fontWeight: 700, color: "#1e3a57", textAlign: "right" }}>{n}</div>
                            </div>
                          ))}
                        </div>
                      );
                    })()}
                  </div>
                </div>
              );
            })()}

            {/* ── COLLABORATEURS ── */}
            {page === "collab" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
                  <button style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Ajouter</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(3,1fr)", gap: 14 }}>
                  {[
                    { nom: "Pierre WILLA SOUMAI", role: "Expert-comptable", email: "p.willasoumai@cabinet.fr", dossiers: 24, statut: "Associé", initials: "PW", color: "#1a5c9e" },
                    { nom: "Sophie Morel", role: "Collaboratrice senior", email: "s.morel@cabinet.fr", dossiers: 18, statut: "CDI", initials: "SM", color: "#1a7a4a" },
                    { nom: "Thomas Bernard", role: "Collaborateur", email: "t.bernard@cabinet.fr", dossiers: 12, statut: "CDI", initials: "TB", color: "#c17f2a" },
                    { nom: "Julie Martin", role: "Assistante comptable", email: "j.martin@cabinet.fr", dossiers: 8, statut: "CDI", initials: "JM", color: "#8e44ad" },
                    { nom: "Lucas Petit", role: "Stagiaire", email: "l.petit@cabinet.fr", dossiers: 3, statut: "Stage", initials: "LP", color: "#c0392b" },
                  ].map((c, i) => (
                    <div key={i} className="card-hover" style={{ ...S.card, display: "flex", flexDirection: "column", gap: 12 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                        <div style={{ width: 46, height: 46, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 15, flexShrink: 0 }}>{c.initials}</div>
                        <div>
                          <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a57" }}>{c.nom}</div>
                          <div style={{ fontSize: 12, color: "#6b8aaa" }}>{c.role}</div>
                        </div>
                      </div>
                      <div style={{ fontSize: 12, color: "#8da4c0" }}>{c.email}</div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ fontSize: 12, color: "#4a6d8c" }}><b style={{ color: "#1e3a57" }}>{c.dossiers}</b> dossiers</span>
                        <span style={{ fontSize: 11, fontWeight: 600, padding: "3px 10px", borderRadius: 20, background: c.statut === "Associé" ? "#e8f0fb" : c.statut === "Stage" ? "#fff8e6" : "#e8f5ee", color: c.statut === "Associé" ? "#1a5c9e" : c.statut === "Stage" ? "#c17f2a" : "#1a7a4a" }}>{c.statut}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── DOCUMENTS ── */}
            {page === "documents" && (
              <div>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14, flexWrap: "wrap", gap: 10 }}>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {["Tous", "Bilans", "Contrats", "Liasses", "Courriers"].map(f => (
                      <button key={f} style={{ padding: "6px 12px", borderRadius: 8, border: "1px solid #e2eaf4", background: f === "Tous" ? "#1a5c9e" : "#fff", color: f === "Tous" ? "#fff" : "#4a6d8c", cursor: "pointer", fontSize: 12 }}>{f}</button>
                    ))}
                  </div>
                  <button style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Déposer</button>
                </div>
                <div className="card-hover" style={S.card}>
                  {[
                    { nom: "Bilan_TechVision_2025.pdf", client: "SAS TechVision", type: "Bilan", taille: "1.2 Mo", date: "15/04/2026", color: "#c0392b" },
                    { nom: "Liasse_Dupont_2025.pdf", client: "SARL Dupont & Fils", type: "Liasse", taille: "856 Ko", date: "10/04/2026", color: "#c0392b" },
                    { nom: "Contrat_mission_Atlasmed.docx", client: "SA Groupe Atlasmed", type: "Contrat", taille: "245 Ko", date: "02/04/2026", color: "#1a5c9e" },
                    { nom: "Courrier_DGFiP_Boulangerie.pdf", client: "EURL Boulangerie Soleil", type: "Courrier", taille: "128 Ko", date: "28/03/2026", color: "#c0392b" },
                    { nom: "Rapport_audit_Atlasmed.xlsx", client: "SA Groupe Atlasmed", type: "Rapport", taille: "3.4 Mo", date: "20/03/2026", color: "#1a7a4a" },
                    { nom: "CGV_Cabinet_2026.docx", client: "Cabinet", type: "Contrat", taille: "98 Ko", date: "01/01/2026", color: "#1a5c9e" },
                  ].map((d, i) => (
                    <div key={i} className="row-hover" style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0f4fa", flexWrap: isMobile ? "wrap" : "nowrap", cursor: "pointer" }}>
                      <div style={{ width: 36, height: 36, borderRadius: 8, background: d.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                        <Icon d={ic.docs} size={16} stroke={d.color} />
                      </div>
                      <div style={{ flex: 2, minWidth: 120 }}>
                        <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a57" }}>{d.nom}</div>
                        <div style={{ fontSize: 11, color: "#8da4c0" }}>{d.client}</div>
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 600, padding: "3px 8px", borderRadius: 6, background: "#f0f4fa", color: "#4a6d8c", flexShrink: 0 }}>{d.type}</div>
                      <div style={{ fontSize: 12, color: "#8da4c0", flexShrink: 0 }}>{d.taille}</div>
                      <div style={{ fontSize: 12, color: "#8da4c0", flexShrink: 0, minWidth: 80 }}>{d.date}</div>
                      <button style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── SERVICES ── */}
            {page === "services" && (() => {
              const SERVICES_DATA = [
                {
                  groupe: "Assistance Comptable",
                  color: "#1a5c9e",
                  bg: "#e8f0fb",
                  icon: ic.folder,
                  items: [
                    "Conseils et stratégies financiers",
                    "Analyse et diagnostic financier",
                    "Ingénierie financière",
                    "Installation et paramétrage de logiciel de gestion (Sage Saari...)",
                    "Production des états financiers de systèmes (DSF - CEP - PT)",
                    "Audit comptable",
                    "Manuel de procédures",
                  ]
                },
                {
                  groupe: "Assistance Fiscale",
                  color: "#c0392b",
                  bg: "#fff0f0",
                  icon: ic.devis,
                  items: [
                    "Déclaration fiscale (TVA - AIR/AIS - RTS - DSF)",
                    "Respect des échéances fiscales",
                    "Élaboration et rédaction des correspondances fiscales",
                    "Élaboration des mesures de sécurité juridico-fiscales",
                    "Élaboration légale des mesures d'optimisation fiscale",
                    "Audit et simulation fiscale avant dépôt DSF",
                    "Constitution d'office en phase juridictionnelle",
                  ]
                },
                {
                  groupe: "Assistance Sociale",
                  color: "#1a7a4a",
                  bg: "#e8f5ee",
                  icon: ic.collab,
                  items: [
                    "Déclarations sociales",
                    "Respect des échéances",
                    "Élaboration des correspondances sociales",
                    "Élaboration des mesures de sécurité juridico-sociales",
                    "Élaboration légale des mesures d'optimisation sociales annuelles",
                  ]
                },
                {
                  groupe: "Assistance Juridique",
                  color: "#8e44ad",
                  bg: "#f5eefb",
                  icon: ic.docs,
                  items: [
                    "Rédaction des contrats",
                    "Rédaction des statuts sous seing privé",
                    "Aide à la création d'entreprise",
                    "Formation du personnel interne",
                  ]
                },
              ];

              const totalServices = SERVICES_DATA.reduce((s, g) => s + g.items.length, 0);

              return (
                <div>
                  {/* Header KPIs */}
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                    {SERVICES_DATA.map((g, i) => (
                      <div key={i} className="card-hover" style={{ background: "#fff", borderRadius: 12, padding: "14px 16px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", borderTop: `3px solid ${g.color}` }}>
                        <div style={{ width: 34, height: 34, borderRadius: 9, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 8 }}>
                          <Icon d={g.icon} size={16} stroke={g.color} />
                        </div>
                        <div style={{ fontSize: 22, fontWeight: 800, color: g.color }}>{g.items.length}</div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: "#1e3a57", marginTop: 2 }}>{g.groupe}</div>
                      </div>
                    ))}
                  </div>

                  {/* Groupes de services */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                    {SERVICES_DATA.map((g, gi) => (
                      <div key={gi} className="card-hover" style={{ ...S.card, borderLeft: `4px solid ${g.color}` }}>
                        {/* En-tête groupe */}
                        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16, paddingBottom: 12, borderBottom: `1px solid ${g.bg}` }}>
                          <div style={{ width: 40, height: 40, borderRadius: 10, background: g.bg, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                            <Icon d={g.icon} size={18} stroke={g.color} />
                          </div>
                          <div>
                            <div style={{ fontSize: 15, fontWeight: 800, color: "#1e3a57" }}>{g.groupe}</div>
                            <div style={{ fontSize: 12, color: "#8da4c0" }}>{g.items.length} service{g.items.length > 1 ? "s" : ""}</div>
                          </div>
                        </div>

                        {/* Liste des services */}
                        <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "repeat(2,1fr)", gap: 10 }}>
                          {g.items.map((item, ii) => (
                            <div key={ii} style={{ display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 12px", borderRadius: 9, background: g.bg, transition: "all 0.2s" }}>
                              <div style={{ width: 20, height: 20, borderRadius: "50%", background: g.color, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, marginTop: 1 }}>
                                <Icon d={ic.check} size={11} stroke="#fff" />
                              </div>
                              <span style={{ fontSize: 13, color: "#1e3a57", fontWeight: 500, lineHeight: 1.4 }}>{item}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Footer total */}
                  <div style={{ marginTop: 16, textAlign: "center", padding: "14px", background: "#fff", borderRadius: 12, boxShadow: "0 1px 3px rgba(0,30,80,.06)" }}>
                    <span style={{ fontSize: 13, color: "#6b8aaa" }}>Total : </span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#1a5c9e" }}>{totalServices} services</span>
                    <span style={{ fontSize: 13, color: "#6b8aaa" }}> répartis en </span>
                    <span style={{ fontSize: 15, fontWeight: 800, color: "#1a5c9e" }}>{SERVICES_DATA.length} groupes</span>
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
                    {[["jour", "Aujourd'hui"], ["semestre", "Ce semestre"], ["annee", "Cette année"], ["tout", "Tout"]].map(([val, label]) => (
                      <button key={val} onClick={() => setDepensePeriode(val)} style={{ padding: "7px 14px", borderRadius: 8, border: "1px solid #e2eaf4", background: depensePeriode === val ? "#1a5c9e" : "#fff", color: depensePeriode === val ? "#fff" : "#4a6d8c", cursor: "pointer", fontSize: 12, fontWeight: 500 }}>{label}</button>
                    ))}
                  </div>
                  <button onClick={() => setShowAddDepense(true)} style={S.primaryBtn}><Icon d={ic.plus} size={14} stroke="#fff" /> Nouvelle dépense</button>
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
                  <div style={S.cardHeader}><Icon d={ic.depenses} size={16} stroke="#c0392b" /><span style={S.cardTitle}>Liste des dépenses — {{"jour": "Aujourd'hui", "semestre": "Ce semestre", "annee": "Cette année", "tout": "Tout"}[depensePeriode]}</span></div>
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
                        <button onClick={() => deleteDepense(d.id)} style={{ width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {/* ── PARAMÈTRES ── */}
            {page === "settings" && (
              <div style={{ maxWidth: 680 }}>
                <div className="card-hover" style={{ ...S.card, marginBottom: 16 }}>
                  <div style={S.cardHeader}><Icon d={ic.collab} size={16} stroke="#1a5c9e" /><span style={S.cardTitle}>Profil du cabinet</span></div>
                  <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 12 }}>
                    {[
                      { label: "Nom du cabinet", placeholder: "Cabinet Legrand & Associés", val: "" },
                      { label: "N° SIRET", placeholder: "123 456 789 00012", val: "" },
                      { label: "Adresse", placeholder: "12 rue de la Paix, Paris", val: "" },
                      { label: "Téléphone", placeholder: "+33 1 23 45 67 89", val: "" },
                      { label: "Email de contact", placeholder: "contact@cabinet.fr", val: "" },
                      { label: "Site web", placeholder: "www.cabinet.fr", val: "" },
                    ].map(f => (
                      <div key={f.label} style={S.formGroup}>
                        <label style={S.label}>{f.label}</label>
                        <input placeholder={f.placeholder} style={S.input} />
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button style={S.primaryBtn}>Enregistrer</button>
                  </div>
                </div>
                <div className="card-hover" style={{ ...S.card, marginBottom: 16 }}>
                  <div style={S.cardHeader}><Icon d={ic.bell} size={16} stroke="#c17f2a" /><span style={S.cardTitle}>Notifications</span></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                    {[
                      { label: "Alertes échéances fiscales", desc: "Recevoir une alerte 7 jours avant", active: true },
                      { label: "Nouveaux messages clients", desc: "Notification immédiate", active: true },
                      { label: "Rappels devis non signés", desc: "Relance automatique après 14 jours", active: false },
                      { label: "Rapport hebdomadaire", desc: "Synthèse envoyée chaque lundi", active: false },
                    ].map((n, i) => (
                      <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderBottom: "1px solid #f0f4fa" }}>
                        <div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a57" }}>{n.label}</div>
                          <div style={{ fontSize: 11, color: "#8da4c0" }}>{n.desc}</div>
                        </div>
                        <div style={{ width: 42, height: 24, borderRadius: 12, background: n.active ? "#1a5c9e" : "#e2eaf4", cursor: "pointer", position: "relative", flexShrink: 0, transition: "background 0.2s" }}>
                          <div style={{ width: 18, height: 18, borderRadius: "50%", background: "#fff", position: "absolute", top: 3, left: n.active ? 21 : 3, transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="card-hover" style={S.card}>
                  <div style={S.cardHeader}><Icon d={ic.settings} size={16} stroke="#6b8aaa" /><span style={S.cardTitle}>Préférences</span></div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    <div style={S.formGroup}>
                      <label style={S.label}>Devise</label>
                      <select style={S.select}><option>Euro (FCFA)</option><option>Franc CFA (XAF)</option><option>Dollar ($)</option></select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Taux de TVA par défaut</label>
                      <select style={S.select}><option>20%</option><option>10%</option><option>5.5%</option><option>0%</option></select>
                    </div>
                    <div style={S.formGroup}>
                      <label style={S.label}>Langue</label>
                      <select style={S.select}><option>Français</option><option>Anglais</option></select>
                    </div>
                  </div>
                  <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 8 }}>
                    <button style={S.primaryBtn}>Enregistrer</button>
                  </div>
                </div>
              </div>
            )}

          </>}
        </div>

        {/* BOTTOM NAV mobile */}
        {isMobile && (
          <nav style={{ position: "fixed", bottom: 0, left: 0, right: 0, background: "#fff", borderTop: "1px solid #e2eaf4", display: "flex", zIndex: 50, paddingBottom: "env(safe-area-inset-bottom)" }}>
            {navItems.filter(item => ["dashboard", "clients", "rapports", "collab", "devis"].includes(item.id)).map(item => (
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
      {showAddClient && (
        <Modal title="Nouveau client" onClose={() => setShowAddClient(false)}>
          {[{ label: "Nom *", key: "nom", placeholder: "SARL Exemple" }, { label: "Secteur", key: "secteur", placeholder: "BTP, Informatique…" }, { label: "CA", key: "ca", placeholder: "500 000 €" }, { label: "Responsable", key: "responsable", placeholder: "M. Martin" }].map(f => (
            <div key={f.key} style={S.formGroup}>
              <label style={S.label}>{f.label}</label>
              <input placeholder={f.placeholder} value={newClient[f.key]} onChange={e => setNewClient(p => ({ ...p, [f.key]: e.target.value }))} style={S.input} />
            </div>
          ))}
          <div style={S.formGroup}>
            <label style={S.label}>Statut</label>
            <select value={newClient.statut} onChange={e => setNewClient(p => ({ ...p, statut: e.target.value }))} style={S.select}>
              {["Actif", "En attente", "Inactif"].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowAddClient(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={addClient} style={S.primaryBtn}>Enregistrer</button>
          </div>
        </Modal>
      )}

      {showAddEcheance && (
        <Modal title="Nouvelle échéance" onClose={() => setShowAddEcheance(false)}>
          {[{ label: "Intitulé *", key: "label", placeholder: "TVA mensuelle — Client X" }, { label: "Client", key: "client", placeholder: "Nom du client" }].map(f => (
            <div key={f.key} style={S.formGroup}>
              <label style={S.label}>{f.label}</label>
              <input placeholder={f.placeholder} value={newEch[f.key]} onChange={e => setNewEch(p => ({ ...p, [f.key]: e.target.value }))} style={S.input} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
            <div style={S.formGroup}>
              <label style={S.label}>Date *</label>
              <input type="date" value={newEch.date} onChange={e => setNewEch(p => ({ ...p, date: e.target.value }))} style={S.select} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Type</label>
              <select value={newEch.type} onChange={e => setNewEch(p => ({ ...p, type: e.target.value }))} style={S.select}>
                {["TVA", "Fiscal", "Bilan", "Social", "Révision"].map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Urgence</label>
              <select value={newEch.urgence} onChange={e => setNewEch(p => ({ ...p, urgence: e.target.value }))} style={S.select}>
                {["haute", "moyenne", "normale"].map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowAddEcheance(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={addEcheance} style={S.primaryBtn}>Enregistrer</button>
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
  overlay: { position: "fixed", inset: 0, background: "rgba(15,39,68,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 16, padding: "24px 28px", width: 480, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 700, color: "#1e3a57" },
};
