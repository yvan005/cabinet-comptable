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
  spinner:   "M12 2v4 M12 18v4 M4.93 4.93l2.83 2.83 M16.24 16.24l2.83 2.83 M2 12h4 M18 12h4 M4.93 19.07l2.83-2.83 M16.24 7.76l2.83-2.83",
};

const MISSIONS = [
  { label: "Tenue comptable mensuelle", prix: 150, unite: "mois" },
  { label: "Révision annuelle des comptes", prix: 800, unite: "an" },
  { label: "Établissement bilan & liasse", prix: 1200, unite: "an" },
  { label: "Déclaration IS", prix: 400, unite: "an" },
  { label: "Gestion paie (par salarié)", prix: 50, unite: "mois/salarié" },
  { label: "Conseil juridique ponctuel", prix: 200, unite: "heure" },
  { label: "Accompagnement création société", prix: 1500, unite: "forfait" },
  { label: "Audit et diagnostic comptable", prix: 2500, unite: "forfait" },
];

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
  const [page, setPage] = useState("dashboard");
  const [searchQuery, setSearchQuery] = useState("");
  const [clientFilter, setClientFilter] = useState("Tous");

  // Data
  const [clients, setClients] = useState([]);
  const [echeances, setEcheances] = useState([]);
  const [messages, setMessages] = useState([]);
  const [devisList, setDevisList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showAddClient, setShowAddClient] = useState(false);
  const [showAddEcheance, setShowAddEcheance] = useState(false);
  const [showAddMessage, setShowAddMessage] = useState(false);

  // Message view
  const [selectedMsg, setSelectedMsg] = useState(null);
  const [replyText, setReplyText] = useState("");

  // Devis
  const [devisLines, setDevisLines] = useState([{ mission: MISSIONS[0], qty: 1 }]);
  const [devisClient, setDevisClient] = useState("");
  const [devisDate, setDevisDate] = useState(new Date().toISOString().split("T")[0]);
  const [devisSaving, setDevisSaving] = useState(false);

  // Forms
  const [newClient, setNewClient] = useState({ nom: "", secteur: "", statut: "Actif", responsable: "", ca: "" });
  const [newEch, setNewEch] = useState({ label: "", date: "", type: "TVA", urgence: "normale", client: "" });
  const [newMsg, setNewMsg] = useState({ de: "", client: "", contenu: "" });

  // Load all data
  const loadAll = useCallback(async () => {
    setLoading(true);
    const [c, e, m, d] = await Promise.all([
      db.get("clients"),
      db.get("echeances"),
      db.get("messages"),
      db.get("devis"),
    ]);
    setClients(Array.isArray(c) ? c : []);
    setEcheances(Array.isArray(e) ? e : []);
    setMessages(Array.isArray(m) ? m : []);
    setDevisList(Array.isArray(d) ? d : []);
    setLoading(false);
  }, []);

  useEffect(() => { loadAll(); }, [loadAll]);

  useEffect(() => {
    if (clients.length > 0 && !devisClient) setDevisClient(clients[0]?.nom || "");
  }, [clients]);

  // ── CLIENTS ──
  const addClient = async () => {
    if (!newClient.nom) return;
    await db.post("clients", newClient);
    setNewClient({ nom: "", secteur: "", statut: "Actif", responsable: "", ca: "" });
    setShowAddClient(false);
    loadAll();
  };
  const deleteClient = async (id) => { await db.delete("clients", id); loadAll(); };

  // ── ÉCHÉANCES ──
  const addEcheance = async () => {
    if (!newEch.label || !newEch.date) return;
    await db.post("echeances", { ...newEch, fait: false });
    setNewEch({ label: "", date: "", type: "TVA", urgence: "normale", client: "" });
    setShowAddEcheance(false);
    loadAll();
  };
  const toggleFait = async (e) => {
    await db.patch("echeances", e.id, { fait: !e.fait });
    loadAll();
  };
  const deleteEch = async (id) => { await db.delete("echeances", id); loadAll(); };

  // ── MESSAGES ──
  const addMessage = async () => {
    if (!newMsg.de || !newMsg.contenu) return;
    await db.post("messages", { ...newMsg, heure: new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }), lu: false });
    setNewMsg({ de: "", client: "", contenu: "" });
    setShowAddMessage(false);
    loadAll();
  };
  const markRead = async (msg) => {
    if (!msg.lu) await db.patch("messages", msg.id, { lu: true });
    setSelectedMsg(msg);
    loadAll();
  };
  const deleteMsg = async (id) => { await db.delete("messages", id); setSelectedMsg(null); loadAll(); };

  // ── DEVIS ──
  const totalHT = devisLines.reduce((s, l) => s + l.mission.prix * l.qty, 0);
  const totalTTC = totalHT * 1.2;
  const addLine = () => setDevisLines(l => [...l, { mission: MISSIONS[0], qty: 1 }]);
  const removeLine = (i) => setDevisLines(l => l.filter((_, idx) => idx !== i));
  const updateLine = (i, field, val) => setDevisLines(l => l.map((ln, idx) => idx === i ? { ...ln, [field]: val } : ln));
  const saveDevis = async (statut) => {
    setDevisSaving(true);
    await db.post("devis", {
      client: devisClient,
      date: devisDate,
      lignes: devisLines.map(l => ({ mission: l.mission.label, prix: l.mission.prix, qty: l.qty })),
      total_ht: totalHT,
      total_ttc: totalTTC,
      statut
    });
    setDevisSaving(false);
    await loadAll();
    alert(`Devis ${statut === "Brouillon" ? "enregistré" : "envoyé"} avec succès !`);
  };

  // ── COMPUTED ──
  const unreadCount = messages.filter(m => !m.lu).length;
  const urgentEch = echeances.filter(e => e.urgence === "haute" && !e.fait);
  const filteredClients = clients.filter(c => {
    const matchF = clientFilter === "Tous" || c.statut === clientFilter;
    const matchS = c.nom?.toLowerCase().includes(searchQuery.toLowerCase()) || c.secteur?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchF && matchS;
  });

  const kpis = [
    { label: "Clients actifs", value: clients.filter(c => c.statut === "Actif").length, delta: `${clients.length} au total`, color: "#1a5c9e", icon: ic.clients },
    { label: "Échéances en cours", value: echeances.filter(e => !e.fait).length, delta: `${urgentEch.length} urgentes`, color: "#c17f2a", icon: ic.calendar },
    { label: "Messages non lus", value: unreadCount, delta: `${messages.length} au total`, color: "#c0392b", icon: ic.message },
    { label: "Devis enregistrés", value: devisList.length, delta: `${devisList.filter(d => d.statut === "Envoyé").length} envoyés`, color: "#1a7a4a", icon: ic.devis },
  ];

  // ── RENDER ───────────────────────────────────────────────────────────────
  return (
    <div style={S.shell}>
      {/* SIDEBAR */}
      <aside style={S.sidebar}>
        <div style={S.logo}>
          <div style={S.logoMark}>EC</div>
          <div>
            <div style={S.logoName}>ExpertCab</div>
            <div style={S.logoSub}>Gestion cabinet</div>
          </div>
        </div>
        <nav style={S.nav}>
          {[
            { id: "dashboard", label: "Tableau de bord", icon: ic.dashboard },
            { id: "clients",   label: "Clients",          icon: ic.clients },
            { id: "echeances", label: "Échéances",        icon: ic.calendar },
            { id: "messages",  label: "Messagerie",       icon: ic.message, badge: unreadCount },
            { id: "devis",     label: "Devis",            icon: ic.devis },
          ].map(item => (
            <button key={item.id} onClick={() => setPage(item.id)} style={{ ...S.navItem, ...(page === item.id ? S.navItemActive : {}) }}>
              <Icon d={item.icon} size={17} stroke={page === item.id ? "#fff" : "#8da4c0"} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.badge > 0 && <span style={S.badge}>{item.badge}</span>}
            </button>
          ))}
        </nav>
        <div style={S.sidebarFooter}>
          <div style={S.avatar}>GL</div>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#e2eaf4" }}>Guillaume Legrand</div>
            <div style={{ fontSize: 11, color: "#6b8aaa" }}>Expert-comptable</div>
          </div>
        </div>
      </aside>

      {/* MAIN */}
      <main style={S.main}>
        <header style={S.topbar}>
          <div style={S.pageTitle}>
            { { dashboard: "Tableau de bord", clients: "Gestion des clients", echeances: "Suivi des échéances", messages: "Messagerie", devis: "Devis" }[page] }
          </div>
          <div style={S.topbarRight}>
            <div style={S.searchWrap}>
              <Icon d={ic.search} size={15} stroke="#8da4c0" />
              <input placeholder="Rechercher…" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} style={S.searchInput} />
            </div>
            <button onClick={loadAll} style={{ ...S.iconBtn, padding: "6px 12px", fontSize: 12, color: "#4a6d8c", border: "1px solid #e2eaf4", borderRadius: 8, background: "#fff" }}>↻ Actualiser</button>
            <div style={S.topAvatar}>GL</div>
          </div>
        </header>

        <div style={S.content}>
          {loading ? <Spinner /> : <>

            {/* ── DASHBOARD ── */}
            {page === "dashboard" && (
              <div>
                <div style={S.kpiGrid}>
                  {kpis.map((k, i) => (
                    <div key={i} style={S.kpiCard}>
                      <div style={{ ...S.kpiIcon, background: k.color + "18" }}>
                        <Icon d={k.icon} size={20} stroke={k.color} />
                      </div>
                      <div style={S.kpiValue}>{k.value}</div>
                      <div style={S.kpiLabel}>{k.label}</div>
                      <div style={S.kpiDelta}>{k.delta}</div>
                    </div>
                  ))}
                </div>
                <div style={S.twoCol}>
                  <div style={S.card}>
                    <div style={S.cardHeader}><Icon d={ic.alert} size={16} stroke="#c0392b" /><span style={S.cardTitle}>Échéances urgentes</span></div>
                    {urgentEch.length === 0 && <div style={S.empty}>Aucune échéance urgente 🎉</div>}
                    {urgentEch.slice(0, 5).map(e => (
                      <div key={e.id} style={S.echeRow}>
                        <div style={{ ...S.typeBadge, background: "#fff0f0", color: "#c0392b" }}>{e.type}</div>
                        <div style={{ flex: 1 }}>
                          <div style={S.echeLabel}>{e.label}</div>
                          <div style={S.echeSub}>{e.client}</div>
                        </div>
                        <div style={S.echeDate}>{new Date(e.date).toLocaleDateString("fr-FR")}</div>
                      </div>
                    ))}
                  </div>
                  <div style={S.card}>
                    <div style={S.cardHeader}><Icon d={ic.message} size={16} stroke="#1a5c9e" /><span style={S.cardTitle}>Messages récents</span></div>
                    {messages.length === 0 && <div style={S.empty}>Aucun message</div>}
                    {messages.slice(0, 4).map(m => (
                      <div key={m.id} onClick={() => { setPage("messages"); markRead(m); }} style={S.msgRow}>
                        <div style={S.msgAvatar}>{m.de?.split(" ").map(w => w[0]).join("") || "?"}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, fontWeight: m.lu ? 500 : 700, color: "#1e3a57" }}>{m.de}</span>
                            <span style={{ fontSize: 11, color: "#8da4c0" }}>{m.heure}</span>
                          </div>
                          <div style={{ fontSize: 12, color: "#8da4c0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.contenu?.substring(0, 52)}…</div>
                        </div>
                        {!m.lu && <div style={S.unreadDot} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* ── CLIENTS ── */}
            {page === "clients" && (
              <div>
                <div style={S.toolbar}>
                  <div style={{ display: "flex", gap: 8 }}>
                    {["Tous", "Actif", "En attente", "Inactif"].map(f => (
                      <button key={f} onClick={() => setClientFilter(f)} style={{ ...S.filterBtn, ...(clientFilter === f ? S.filterBtnActive : {}) }}>{f}</button>
                    ))}
                  </div>
                  <button onClick={() => setShowAddClient(true)} style={S.primaryBtn}><Icon d={ic.plus} size={15} stroke="#fff" /> Nouveau client</button>
                </div>
                <div style={S.table}>
                  <div style={S.tableHead}>
                    <div style={{ flex: 2.5 }}>Client</div>
                    <div style={{ flex: 1.2 }}>Secteur</div>
                    <div style={{ flex: 1 }}>CA</div>
                    <div style={{ flex: 1.2 }}>Responsable</div>
                    <div style={{ flex: 0.8, textAlign: "center" }}>Statut</div>
                    <div style={{ flex: 0.5, textAlign: "center" }}>Action</div>
                  </div>
                  {filteredClients.length === 0 && <div style={{ ...S.empty, padding: 24 }}>Aucun client trouvé</div>}
                  {filteredClients.map(c => (
                    <div key={c.id} style={S.tableRow}>
                      <div style={{ flex: 2.5, display: "flex", alignItems: "center", gap: 10 }}>
                        <div style={S.clientIcon}>{c.nom?.charAt(0) || "?"}</div>
                        <span style={{ fontWeight: 600, color: "#1e3a57", fontSize: 13 }}>{c.nom}</span>
                      </div>
                      <div style={{ flex: 1.2, fontSize: 13, color: "#4a6d8c" }}>{c.secteur}</div>
                      <div style={{ flex: 1, fontSize: 13, fontWeight: 600, color: "#1e3a57" }}>{c.ca}</div>
                      <div style={{ flex: 1.2, fontSize: 13, color: "#4a6d8c" }}>{c.responsable}</div>
                      <div style={{ flex: 0.8, textAlign: "center" }}>
                        <span style={{ ...S.statutBadge, background: c.statut === "Actif" ? "#e8f5ee" : c.statut === "En attente" ? "#fff8e6" : "#f5f5f5", color: c.statut === "Actif" ? "#1a7a4a" : c.statut === "En attente" ? "#c17f2a" : "#8a9aac" }}>{c.statut}</span>
                      </div>
                      <div style={{ flex: 0.5, textAlign: "center" }}>
                        <button onClick={() => deleteClient(c.id)} style={S.dangerBtn}><Icon d={ic.trash} size={14} stroke="#c0392b" /></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── ÉCHÉANCES ── */}
            {page === "echeances" && (
              <div>
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 16 }}>
                  <button onClick={() => setShowAddEcheance(true)} style={S.primaryBtn}><Icon d={ic.plus} size={15} stroke="#fff" /> Nouvelle échéance</button>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Haute priorité", count: echeances.filter(e => e.urgence === "haute" && !e.fait).length, color: "#c0392b", bg: "#fff0f0" },
                    { label: "Priorité moyenne", count: echeances.filter(e => e.urgence === "moyenne" && !e.fait).length, color: "#c17f2a", bg: "#fff8e6" },
                    { label: "Terminées", count: echeances.filter(e => e.fait).length, color: "#1a7a4a", bg: "#e8f5ee" },
                  ].map((s, i) => (
                    <div key={i} style={{ ...S.card, flexDirection: "row", alignItems: "center", gap: 16, padding: "16px 20px" }}>
                      <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, fontWeight: 800, color: s.color }}>{s.count}</div>
                      <span style={{ fontSize: 13, color: "#4a6d8c", fontWeight: 500 }}>{s.label}</span>
                    </div>
                  ))}
                </div>
                <div style={S.card}>
                  {echeances.length === 0 && <div style={S.empty}>Aucune échéance enregistrée</div>}
                  {[...echeances].sort((a, b) => new Date(a.date) - new Date(b.date)).map(e => {
                    const uc = { haute: { bg: "#fff0f0", dot: "#c0392b" }, moyenne: { bg: "#fff8e6", dot: "#c17f2a" }, normale: { bg: "#e8f5ee", dot: "#1a7a4a" } }[e.urgence] || { bg: "#f5f5f5", dot: "#888" };
                    const daysLeft = Math.round((new Date(e.date) - new Date()) / 86400000);
                    return (
                      <div key={e.id} style={{ ...S.echeanceFull, opacity: e.fait ? 0.5 : 1 }}>
                        <div style={{ width: 8, height: 8, borderRadius: "50%", background: uc.dot, marginTop: 2, flexShrink: 0 }} />
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: 14, color: "#1e3a57", textDecoration: e.fait ? "line-through" : "none" }}>{e.label}</div>
                          <div style={{ fontSize: 12, color: "#6b8aaa", marginTop: 2 }}>{e.client}</div>
                        </div>
                        <div style={{ ...S.typeBadge, background: uc.bg, color: uc.dot }}>{e.type}</div>
                        <div style={{ textAlign: "right", minWidth: 90 }}>
                          <div style={{ fontSize: 13, fontWeight: 600, color: "#1e3a57" }}>{new Date(e.date).toLocaleDateString("fr-FR")}</div>
                          <div style={{ fontSize: 11, color: daysLeft <= 5 ? "#c0392b" : "#6b8aaa" }}>{e.fait ? "✓ Fait" : daysLeft <= 0 ? "Dépassée" : `J-${daysLeft}`}</div>
                        </div>
                        <button onClick={() => toggleFait(e)} style={S.checkBtn}><Icon d={ic.check} size={14} stroke="#1a7a4a" /></button>
                        <button onClick={() => deleteEch(e.id)} style={S.dangerBtn}><Icon d={ic.trash} size={14} stroke="#c0392b" /></button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── MESSAGERIE ── */}
            {page === "messages" && (
              <div style={{ display: "flex", gap: 16, height: "calc(100vh - 140px)" }}>
                <div style={{ ...S.card, width: 300, flexShrink: 0, padding: 0, overflow: "hidden", display: "flex", flexDirection: "column" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #e8eef5", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: "#1e3a57" }}>Conversations ({messages.length})</span>
                    <button onClick={() => setShowAddMessage(true)} style={{ ...S.primaryBtn, padding: "5px 10px", fontSize: 11 }}><Icon d={ic.plus} size={12} stroke="#fff" /> Nouveau</button>
                  </div>
                  <div style={{ overflowY: "auto", flex: 1 }}>
                    {messages.length === 0 && <div style={S.empty}>Aucun message</div>}
                    {messages.map(m => (
                      <div key={m.id} onClick={() => markRead(m)} style={{ ...S.convItem, background: selectedMsg?.id === m.id ? "#f0f6ff" : "transparent", borderLeft: selectedMsg?.id === m.id ? "3px solid #1a5c9e" : "3px solid transparent" }}>
                        <div style={S.msgAvatar}>{m.de?.split(" ").map(w => w[0]).join("") || "?"}</div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: "flex", justifyContent: "space-between" }}>
                            <span style={{ fontSize: 13, fontWeight: m.lu ? 500 : 700, color: "#1e3a57" }}>{m.de}</span>
                            <span style={{ fontSize: 11, color: "#8da4c0" }}>{m.heure}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#8da4c0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{m.contenu?.substring(0, 40)}…</div>
                        </div>
                        {!m.lu && <div style={S.unreadDot} />}
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ ...S.card, flex: 1, display: "flex", flexDirection: "column", padding: 0, overflow: "hidden" }}>
                  {selectedMsg ? (
                    <>
                      <div style={{ padding: "16px 24px", borderBottom: "1px solid #e8eef5", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                          <div style={{ ...S.msgAvatar, width: 40, height: 40, fontSize: 15 }}>{selectedMsg.de?.split(" ").map(w => w[0]).join("") || "?"}</div>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: "#1e3a57" }}>{selectedMsg.de}</div>
                            <div style={{ fontSize: 12, color: "#6b8aaa" }}>{selectedMsg.client} · {selectedMsg.heure}</div>
                          </div>
                        </div>
                        <button onClick={() => deleteMsg(selectedMsg.id)} style={S.dangerBtn}><Icon d={ic.trash} size={15} stroke="#c0392b" /></button>
                      </div>
                      <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
                        <div style={S.bubble}>{selectedMsg.contenu}</div>
                      </div>
                      <div style={{ padding: "16px 24px", borderTop: "1px solid #e8eef5", display: "flex", gap: 12 }}>
                        <textarea placeholder="Votre réponse…" value={replyText} onChange={e => setReplyText(e.target.value)} style={S.replyBox} rows={2} />
                        <button onClick={() => setReplyText("")} style={S.sendBtn}><Icon d={ic.send} size={17} stroke="#fff" /></button>
                      </div>
                    </>
                  ) : (
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", color: "#8da4c0" }}>
                      <Icon d={ic.message} size={40} stroke="#c8d8e8" />
                      <div style={{ marginTop: 12, fontSize: 14 }}>Sélectionnez une conversation</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* ── DEVIS ── */}
            {page === "devis" && (
              <div>
                <div style={{ maxWidth: 780 }}>
                  <div style={S.card}>
                    <div style={S.cardHeader}><Icon d={ic.devis} size={16} stroke="#1a5c9e" /><span style={S.cardTitle}>Simuler un devis</span></div>
                    <div style={{ display: "flex", gap: 16, marginBottom: 20 }}>
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
                    <div style={S.devisTableHead}>
                      <div style={{ flex: 3 }}>Mission</div>
                      <div style={{ flex: 1, textAlign: "center" }}>Qté</div>
                      <div style={{ flex: 1, textAlign: "right" }}>P.U. HT</div>
                      <div style={{ flex: 1, textAlign: "right" }}>Total HT</div>
                      <div style={{ width: 36 }} />
                    </div>
                    {devisLines.map((line, i) => (
                      <div key={i} style={S.devisRow}>
                        <div style={{ flex: 3 }}>
                          <select value={line.mission.label} onChange={e => updateLine(i, "mission", MISSIONS.find(m => m.label === e.target.value))} style={{ ...S.select, width: "100%" }}>
                            {MISSIONS.map(m => <option key={m.label}>{m.label}</option>)}
                          </select>
                        </div>
                        <div style={{ flex: 1, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                          <input type="number" min={1} value={line.qty} onChange={e => updateLine(i, "qty", parseInt(e.target.value) || 1)} style={{ ...S.select, width: 55, textAlign: "center", padding: "8px 4px" }} />
                        </div>
                        <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 500, color: "#1e3a57", alignSelf: "center" }}>{line.mission.prix.toLocaleString("fr-FR")} €</div>
                        <div style={{ flex: 1, textAlign: "right", fontSize: 13, fontWeight: 700, color: "#1a5c9e", alignSelf: "center" }}>{(line.mission.prix * line.qty).toLocaleString("fr-FR")} €</div>
                        <button onClick={() => removeLine(i)} style={S.removeBtn}>×</button>
                      </div>
                    ))}
                    <button onClick={addLine} style={S.addLineBtn}><Icon d={ic.plus} size={14} stroke="#1a5c9e" /> Ajouter une ligne</button>
                    <div style={S.totaux}>
                      <div style={S.totalRow}><span style={{ color: "#6b8aaa" }}>Total HT</span><span style={{ fontWeight: 600 }}>{totalHT.toLocaleString("fr-FR")} €</span></div>
                      <div style={S.totalRow}><span style={{ color: "#6b8aaa" }}>TVA (20%)</span><span style={{ fontWeight: 600 }}>{(totalHT * 0.2).toLocaleString("fr-FR")} €</span></div>
                      <div style={{ ...S.totalRow, borderTop: "2px solid #1a5c9e", paddingTop: 12, marginTop: 4 }}>
                        <span style={{ fontWeight: 700, fontSize: 16, color: "#1e3a57" }}>Total TTC</span>
                        <span style={{ fontWeight: 800, fontSize: 20, color: "#1a5c9e" }}>{totalTTC.toLocaleString("fr-FR", { maximumFractionDigits: 2 })} €</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", gap: 12, justifyContent: "flex-end", marginTop: 20 }}>
                      <button onClick={() => saveDevis("Brouillon")} disabled={devisSaving} style={S.secondaryBtn}>{devisSaving ? "…" : "Enregistrer le brouillon"}</button>
                      <button onClick={() => saveDevis("Envoyé")} disabled={devisSaving} style={S.primaryBtn}><Icon d={ic.send} size={14} stroke="#fff" />{devisSaving ? "…" : "Envoyer au client"}</button>
                    </div>
                  </div>

                  {/* Historique devis */}
                  {devisList.length > 0 && (
                    <div style={{ ...S.card, marginTop: 16 }}>
                      <div style={S.cardHeader}><Icon d={ic.folder} size={16} stroke="#4a6d8c" /><span style={S.cardTitle}>Historique des devis</span></div>
                      {devisList.map(d => (
                        <div key={d.id} style={S.echeanceFull}>
                          <div style={{ flex: 2 }}>
                            <div style={{ fontWeight: 600, fontSize: 13, color: "#1e3a57" }}>{d.client}</div>
                            <div style={{ fontSize: 11, color: "#8da4c0" }}>{d.date ? new Date(d.date).toLocaleDateString("fr-FR") : "—"}</div>
                          </div>
                          <div style={{ flex: 1, textAlign: "right", fontWeight: 700, fontSize: 14, color: "#1a5c9e" }}>{d.total_ttc?.toLocaleString("fr-FR")} € TTC</div>
                          <span style={{ ...S.statutBadge, background: d.statut === "Envoyé" ? "#e8f5ee" : "#f5f8fc", color: d.statut === "Envoyé" ? "#1a7a4a" : "#6b8aaa" }}>{d.statut}</span>
                          <button onClick={() => db.delete("devis", d.id).then(loadAll)} style={S.dangerBtn}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

          </>}
        </div>
      </main>

      {/* ── MODALS ── */}
      {showAddClient && (
        <Modal title="Nouveau client" onClose={() => setShowAddClient(false)}>
          {[
            { label: "Nom *", key: "nom", placeholder: "SARL Exemple" },
            { label: "Secteur", key: "secteur", placeholder: "BTP, Informatique…" },
            { label: "CA", key: "ca", placeholder: "500 000 €" },
            { label: "Responsable", key: "responsable", placeholder: "M. Martin" },
          ].map(f => (
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
            <button onClick={() => setShowAddClient(false)} style={S.secondaryBtn}>Annuler</button>
            <button onClick={addClient} style={S.primaryBtn}>Enregistrer</button>
          </div>
        </Modal>
      )}

      {showAddEcheance && (
        <Modal title="Nouvelle échéance" onClose={() => setShowAddEcheance(false)}>
          {[
            { label: "Intitulé *", key: "label", placeholder: "TVA mensuelle — Client X" },
            { label: "Client", key: "client", placeholder: "Nom du client" },
          ].map(f => (
            <div key={f.key} style={S.formGroup}>
              <label style={S.label}>{f.label}</label>
              <input placeholder={f.placeholder} value={newEch[f.key]} onChange={e => setNewEch(p => ({ ...p, [f.key]: e.target.value }))} style={S.input} />
            </div>
          ))}
          <div style={{ display: "flex", gap: 12 }}>
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
            <button onClick={() => setShowAddEcheance(false)} style={S.secondaryBtn}>Annuler</button>
            <button onClick={addEcheance} style={S.primaryBtn}>Enregistrer</button>
          </div>
        </Modal>
      )}

      {showAddMessage && (
        <Modal title="Nouveau message" onClose={() => setShowAddMessage(false)}>
          {[
            { label: "De *", key: "de", placeholder: "M. Dupont" },
            { label: "Client", key: "client", placeholder: "SARL Exemple" },
          ].map(f => (
            <div key={f.key} style={S.formGroup}>
              <label style={S.label}>{f.label}</label>
              <input placeholder={f.placeholder} value={newMsg[f.key]} onChange={e => setNewMsg(p => ({ ...p, [f.key]: e.target.value }))} style={S.input} />
            </div>
          ))}
          <div style={S.formGroup}>
            <label style={S.label}>Message *</label>
            <textarea rows={4} placeholder="Contenu du message…" value={newMsg.contenu} onChange={e => setNewMsg(p => ({ ...p, contenu: e.target.value }))} style={{ ...S.input, resize: "vertical" }} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowAddMessage(false)} style={S.secondaryBtn}>Annuler</button>
            <button onClick={addMessage} style={S.primaryBtn}>Enregistrer</button>
          </div>
        </Modal>
      )}
    </div>
  );
}

// ── STYLES ───────────────────────────────────────────────────────────────────
const S = {
  shell: { display: "flex", minHeight: "100vh", background: "#f0f4fa", fontFamily: "'DM Sans','Segoe UI',sans-serif" },
  sidebar: { width: 230, background: "#0f2744", display: "flex", flexDirection: "column", flexShrink: 0, padding: "24px 0" },
  logo: { display: "flex", alignItems: "center", gap: 12, padding: "0 20px 28px" },
  logoMark: { width: 38, height: 38, borderRadius: 10, background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 800, fontSize: 14 },
  logoName: { color: "#e2eaf4", fontWeight: 800, fontSize: 15 },
  logoSub: { color: "#4a6d8c", fontSize: 11 },
  nav: { display: "flex", flexDirection: "column", gap: 2, padding: "0 12px", flex: 1 },
  navItem: { display: "flex", alignItems: "center", gap: 10, padding: "10px 12px", borderRadius: 9, background: "none", border: "none", cursor: "pointer", color: "#8da4c0", fontSize: 13, fontWeight: 500, textAlign: "left" },
  navItemActive: { background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", color: "#fff", fontWeight: 600 },
  badge: { background: "#c0392b", color: "#fff", borderRadius: 10, fontSize: 10, fontWeight: 700, padding: "1px 6px", minWidth: 18, textAlign: "center" },
  sidebarFooter: { display: "flex", alignItems: "center", gap: 10, padding: "20px 20px 0", borderTop: "1px solid #1a3558", marginTop: "auto" },
  avatar: { width: 36, height: 36, borderRadius: "50%", background: "#1a5c9e", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 13 },
  main: { flex: 1, display: "flex", flexDirection: "column", minWidth: 0 },
  topbar: { background: "#fff", borderBottom: "1px solid #e2eaf4", padding: "0 28px", height: 60, display: "flex", alignItems: "center", justifyContent: "space-between", flexShrink: 0 },
  pageTitle: { fontSize: 17, fontWeight: 700, color: "#1e3a57" },
  topbarRight: { display: "flex", alignItems: "center", gap: 12 },
  searchWrap: { display: "flex", alignItems: "center", gap: 8, background: "#f5f8fc", border: "1px solid #e2eaf4", borderRadius: 8, padding: "7px 14px" },
  searchInput: { border: "none", background: "transparent", outline: "none", fontSize: 13, color: "#1e3a57", width: 150 },
  iconBtn: { background: "none", border: "none", cursor: "pointer", padding: 6 },
  topAvatar: { width: 34, height: 34, borderRadius: "50%", background: "#1a5c9e", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, cursor: "pointer" },
  content: { padding: 24, overflowY: "auto", flex: 1 },
  kpiGrid: { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 14, marginBottom: 20 },
  kpiCard: { background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", display: "flex", flexDirection: "column", gap: 4 },
  kpiIcon: { width: 40, height: 40, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 },
  kpiValue: { fontSize: 28, fontWeight: 800, color: "#1e3a57", lineHeight: 1.1 },
  kpiLabel: { fontSize: 12, color: "#6b8aaa", fontWeight: 500 },
  kpiDelta: { fontSize: 11, color: "#8da4c0", marginTop: 2 },
  twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14, marginBottom: 14 },
  card: { background: "#fff", borderRadius: 12, padding: "18px 20px", boxShadow: "0 1px 3px rgba(0,30,80,.06)" },
  cardHeader: { display: "flex", alignItems: "center", gap: 8, marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: 700, color: "#1e3a57" },
  empty: { fontSize: 13, color: "#8da4c0", padding: "12px 0", textAlign: "center" },
  echeRow: { display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderBottom: "1px solid #f0f4fa" },
  typeBadge: { fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 6, flexShrink: 0 },
  echeLabel: { fontSize: 13, fontWeight: 600, color: "#1e3a57" },
  echeSub: { fontSize: 11, color: "#8da4c0" },
  echeDate: { fontSize: 12, fontWeight: 600, color: "#4a6d8c", flexShrink: 0 },
  msgRow: { display: "flex", alignItems: "flex-start", gap: 10, padding: "10px 0", borderBottom: "1px solid #f0f4fa", cursor: "pointer" },
  msgAvatar: { width: 34, height: 34, borderRadius: "50%", background: "#e2eaf4", color: "#4a6d8c", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, flexShrink: 0 },
  unreadDot: { width: 8, height: 8, borderRadius: "50%", background: "#1a5c9e", flexShrink: 0, marginTop: 6 },
  toolbar: { display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 },
  filterBtn: { padding: "7px 14px", borderRadius: 8, border: "1px solid #e2eaf4", background: "#fff", cursor: "pointer", fontSize: 12, color: "#4a6d8c", fontWeight: 500 },
  filterBtnActive: { background: "#1a5c9e", color: "#fff", border: "1px solid #1a5c9e" },
  primaryBtn: { display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, background: "#1a5c9e", color: "#fff", border: "none", cursor: "pointer", fontSize: 13, fontWeight: 600 },
  secondaryBtn: { display: "flex", alignItems: "center", gap: 7, padding: "9px 18px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13, fontWeight: 500 },
  dangerBtn: { width: 30, height: 30, borderRadius: 7, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  checkBtn: { width: 30, height: 30, borderRadius: 7, border: "1px solid #e2eaf4", background: "#f5f8fc", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  table: { background: "#fff", borderRadius: 12, overflow: "hidden", boxShadow: "0 1px 3px rgba(0,30,80,.06)" },
  tableHead: { display: "flex", padding: "12px 20px", background: "#f5f8fc", borderBottom: "1px solid #e2eaf4", fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", letterSpacing: 0.5 },
  tableRow: { display: "flex", alignItems: "center", padding: "13px 20px", borderBottom: "1px solid #f0f4fa" },
  clientIcon: { width: 32, height: 32, borderRadius: 8, background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 13, flexShrink: 0 },
  statutBadge: { fontSize: 11, fontWeight: 600, padding: "4px 10px", borderRadius: 20 },
  echeanceFull: { display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: "1px solid #f0f4fa" },
  convItem: { display: "flex", alignItems: "flex-start", gap: 10, padding: "12px 14px", cursor: "pointer", borderBottom: "1px solid #f5f8fc" },
  bubble: { background: "#f0f4fa", borderRadius: "4px 16px 16px 16px", padding: "14px 18px", fontSize: 14, color: "#1e3a57", lineHeight: 1.6, maxWidth: 520 },
  replyBox: { flex: 1, border: "1px solid #87CEEB", borderRadius: 10, padding: "10px 14px", fontSize: 13, color: "#1e3a57", background: "#ffffff", resize: "none", outline: "none", fontFamily: "inherit" },
  sendBtn: { width: 44, height: 44, borderRadius: 10, background: "#1a5c9e", border: "none", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  formGroup: { flex: 1, display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 },
  label: { fontSize: 12, fontWeight: 600, color: "#4a6d8c" },
  input: { padding: "9px 12px", borderRadius: 8, border: "1px solid #87CEEB", fontSize: 13, color: "#1e3a57", background: "#ffffff", outline: "none", fontFamily: "inherit" },
  select: { padding: "9px 12px", borderRadius: 8, border: "1px solid #87CEEB", fontSize: 13, color: "#1e3a57", background: "#ffffff", outline: "none" },
  devisTableHead: { display: "flex", alignItems: "center", padding: "8px 0", borderBottom: "2px solid #e2eaf4", marginBottom: 8, fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", letterSpacing: 0.5 },
  devisRow: { display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: "1px solid #f0f4fa" },
  removeBtn: { width: 28, height: 28, borderRadius: 6, border: "1px solid #e2eaf4", background: "#fff", cursor: "pointer", color: "#c0392b", fontSize: 18, display: "flex", alignItems: "center", justifyContent: "center" },
  addLineBtn: { display: "flex", alignItems: "center", gap: 7, padding: "8px 0", background: "none", border: "none", cursor: "pointer", color: "#1a5c9e", fontSize: 13, fontWeight: 600, marginTop: 8 },
  totaux: { background: "#f5f8fc", borderRadius: 10, padding: "16px 20px", marginTop: 20, display: "flex", flexDirection: "column", gap: 8 },
  totalRow: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 14, color: "#1e3a57" },
  overlay: { position: "fixed", inset: 0, background: "rgba(15,39,68,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 16, padding: "24px 28px", width: 480, maxWidth: "90vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 700, color: "#1e3a57" },
};
