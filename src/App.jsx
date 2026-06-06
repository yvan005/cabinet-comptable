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
  eye:       "M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z M12 9a3 3 0 100 6 3 3 0 000-6z",
  abonnement: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M12 6v6l4 2 M8 16h8",
  abo:       "M12 2a10 10 0 100 20A10 10 0 0012 2z M12 6v6l4 2 M8 2h8 M12 22v-2",
  abonnement:"M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M12 6v6l4 2 M8 17h8 M8 13h4",
  abonnement: "M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z M8 12h8 M12 8v8",
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
  const [page, setPage] = useState("dashboard");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
  const [showAddAbonnement, setShowAddAbonnement] = useState(false);
  const [showAddAbo, setShowAddAbo] = useState(false);
  const [aboFilter, setAboFilter] = useState("Tous");
  const [newAbo, setNewAbo] = useState({ client: "", service: "", montant: "", frequence: "Mensuel", date_debut: new Date().toISOString().split("T")[0], statut: "Actif", note: "" });
  const [newAbonnement, setNewAbonnement] = useState({ client: "", service: "", montant: "", frequence: "Mensuel", date_debut: new Date().toISOString().split("T")[0], prochaine_echeance: "", statut: "Actif", note: "" });
  const [serviceSearch, setServiceSearch] = useState("");
  const [abonnements, setAbonnements] = useState([]);
  const [devisClientSearch, setDevisClientSearch] = useState("");
  const [devisServiceSearch, setDevisServiceSearch] = useState("");
  const [showClientDropdown, setShowClientDropdown] = useState(false);
  const [showServiceDropdown, setShowServiceDropdown] = useState(null);
  const [previewDevis, setPreviewDevis] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  const [editingDevisId, setEditingDevisId] = useState(null);

  const [newClient, setNewClient] = useState({ nom: "", secteur: "", statut: "Actif", responsable: "", ca: "" });

  const loadAll = useCallback(async () => {
    setLoading(true);
    const [c, d, dep, srv, abo] = await Promise.all([
      db.get("clients"), db.get("devis"), db.get("depenses"), db.get("services"), db.get("abonnements"),
    ]);
    setClients(Array.isArray(c) ? c : []);
    setDevisList(Array.isArray(d) ? d : []);
    setDepenses(Array.isArray(dep) ? dep : []);
    setServices(Array.isArray(srv) ? srv : []);
    setAbonnements(Array.isArray(abo) ? abo : []);
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
    await db.post({ ...newEch, fait: false });
    setNewEch({ label: "", date: "", type: "TVA", urgence: "normale", client: "" });
    setShowAddEcheance(false); loadAll();
  };
  const toggleFait = async (e) => { await db.patch(e.id, { fait: !e.fait }); loadAll(); };
  const deleteEch = async (id) => { await db.delete(id); loadAll(); };

  // MESSAGES

  // ABONNEMENTS
  const addAbonnement = async () => {
    if (!newAbonnement.client || !newAbonnement.service || !newAbonnement.montant) return;
    await db.post("abonnements", { ...newAbonnement, montant: parseFloat(newAbonnement.montant) });
    setNewAbonnement({ client: "", service: "", montant: "", frequence: "Mensuel", date_debut: new Date().toISOString().split("T")[0], statut: "Actif", note: "" });
    setShowAddAbonnement(false); loadAll();
  };
  const toggleAbonnementStatut = async (a, statut) => { await db.patch("abonnements", a.id, { statut }); loadAll(); };
  const deleteAbonnement = async (id) => { await db.delete("abonnements", id); loadAll(); };
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
    { label: "Abonnements actifs", value: abonnements.filter(a => a.statut === "Actif").length, delta: abonnements.filter(a => a.statut === "Actif" && a.prochaine_echeance && new Date(a.prochaine_echeance) < new Date()).length + " en retard", color: "#c17f2a", icon: ic.abonnement },
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
    { id: "settings",     label: "Paramètres",        icon: ic.settings },
  ];

  const pageTitle = { abonnement: "Abonnements", dashboard: "Tableau de bord", clients: "Clients", devis: "Devis", rapports: "Rapports", collab: "Collaborateurs", documents: "Documents", services: "Services", abonnement: "Abonnements", depenses: "Dépenses", settings: "Paramètres" }[page];

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
                {/* KPIs principaux */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4,1fr)", gap: 12, marginBottom: 20 }}>
                  {[
                    { label: "Clients actifs", value: clients.filter(c => c.statut === "Actif").length, delta: clients.length + " au total", color: "#1a5c9e", icon: ic.clients, page: "clients" },
                    { label: "Abonnements actifs", value: abonnements.filter(a => a.statut === "Actif").length, delta: abonnements.filter(a => a.statut === "Actif" && a.prochaine_echeance && new Date(a.prochaine_echeance) < new Date()).length + " en retard", color: "#c17f2a", icon: ic.abonnement, page: "abonnements" },
                    { label: "Devis enregistrés", value: devisList.length, delta: devisList.filter(d => d.statut === "Payé").length + " payés", color: "#1a7a4a", icon: ic.devis, page: "devis" },
                    { label: "Dépenses du mois", value: (() => { const now = new Date(); return depenses.filter(d => { const dt = new Date(d.date); return dt.getFullYear() === now.getFullYear() && dt.getMonth() === now.getMonth(); }).reduce((s,d) => s + (d.montant||0), 0).toLocaleString("fr-FR") + " FCFA"; })(), delta: "Ce mois", color: "#c0392b", icon: ic.depenses, page: "depenses" },
                  ].map((k, i) => (
                    <div key={i} className="card-hover" onClick={() => setPage(k.page)} style={{ background: "#fff", borderRadius: 12, padding: isMobile ? "12px" : "16px 18px", boxShadow: "0 1px 3px rgba(0,30,80,.06)", display: "flex", flexDirection: "column", gap: 4, borderTop: "3px solid " + k.color, cursor: "pointer" }}>
                      <div style={{ width: 34, height: 34, borderRadius: 9, background: k.color + "18", display: "flex", alignItems: "center", justifyContent: "center", marginBottom: 4 }}>
                        <Icon d={k.icon} size={16} stroke={k.color} />
                      </div>
                      <div style={{ fontSize: isMobile ? 20 : 24, fontWeight: 800, color: "#1e3a57" }}>{k.value}</div>
                      <div style={{ fontSize: 11, color: "#6b8aaa", fontWeight: 500 }}>{k.label}</div>
                      <div style={{ fontSize: 10, color: "#8da4c0" }}>{k.delta}</div>
                    </div>
                  ))}
                </div>

                {/* Aperçus des menus */}
                <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: 14, marginBottom: 14 }}>

                  {/* Aperçu Clients */}
                  <div className="card-hover" style={S.card}>
                    <div style={{ ...S.cardHeader, cursor: "pointer" }} onClick={() => setPage("clients")}>
                      <Icon d={ic.clients} size={16} stroke="#1a5c9e" />
                      <span style={S.cardTitle}>Clients récents</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#1a5c9e", fontWeight: 600 }}>Voir tout →</span>
                    </div>
                    {clients.length === 0 && <div style={S.empty}>Aucun client</div>}
                    {clients.slice(0, 3).map(c => (
                      <div key={c.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f4fa" }}>
                        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#2e7fcf,#1a5c9e)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 12, flexShrink: 0 }}>{c.nom?.charAt(0)}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{c.nom}</div>
                          <div style={{ fontSize: 11, color: "#8da4c0" }}>{c.secteur}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: c.statut === "Actif" ? "#e8f5ee" : "#f5f5f5", color: c.statut === "Actif" ? "#1a7a4a" : "#8a9aac" }}>{c.statut}</span>
                      </div>
                    ))}
                  </div>

                  {/* Aperçu Abonnements */}
                  <div className="card-hover" style={S.card}>
                    <div style={{ ...S.cardHeader, cursor: "pointer" }} onClick={() => setPage("abonnements")}>
                      <Icon d={ic.abonnement} size={16} stroke="#c17f2a" />
                      <span style={S.cardTitle}>Abonnements en cours</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#1a5c9e", fontWeight: 600 }}>Voir tout →</span>
                    </div>
                    {abonnements.length === 0 && <div style={S.empty}>Aucun abonnement</div>}
                    {abonnements.filter(a => a.statut === "Actif").slice(0, 3).map(a => {
                      const now = new Date();
                      const daysLeft = a.prochaine_echeance ? Math.round((new Date(a.prochaine_echeance) - now) / 86400000) : null;
                      return (
                        <div key={a.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f4fa" }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{a.client}</div>
                            <div style={{ fontSize: 11, color: "#8da4c0" }}>{a.service}</div>
                          </div>
                          <div style={{ textAlign: "right" }}>
                            <div style={{ fontSize: 12, fontWeight: 700, color: "#1a5c9e" }}>{(a.montant||0).toLocaleString("fr-FR")} FCFA</div>
                            {daysLeft !== null && <div style={{ fontSize: 10, color: daysLeft < 0 ? "#c0392b" : "#8da4c0" }}>{daysLeft < 0 ? "⚠️ Retard" : "J-" + daysLeft}</div>}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Aperçu Devis */}
                  <div className="card-hover" style={S.card}>
                    <div style={{ ...S.cardHeader, cursor: "pointer" }} onClick={() => setPage("devis")}>
                      <Icon d={ic.devis} size={16} stroke="#1a7a4a" />
                      <span style={S.cardTitle}>Derniers devis</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#1a5c9e", fontWeight: 600 }}>Voir tout →</span>
                    </div>
                    {devisList.length === 0 && <div style={S.empty}>Aucun devis</div>}
                    {devisList.slice(0, 3).map((d, idx) => (
                      <div key={d.id} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f4fa" }}>
                        <div style={{ fontSize: 10, fontWeight: 700, color: "#1a5c9e", background: "#e8f0fb", padding: "2px 6px", borderRadius: 5, flexShrink: 0 }}>{"DEV-" + String(devisList.length - idx).padStart(4,"0")}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{d.client}</div>
                        </div>
                        <div style={{ textAlign: "right" }}>
                          <div style={{ fontSize: 12, fontWeight: 700, color: "#1a5c9e" }}>{(d.total_ttc||0).toLocaleString("fr-FR", {maximumFractionDigits:0})} FCFA</div>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "1px 6px", borderRadius: 10, background: d.statut === "Payé" ? "#1a7a4a" : d.statut === "Enregistré" ? "#e8f0fb" : "#f5f5f5", color: d.statut === "Payé" ? "#fff" : d.statut === "Enregistré" ? "#1a5c9e" : "#8a9aac" }}>{d.statut}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Aperçu Rapport */}
                  <div className="card-hover" style={S.card}>
                    <div style={{ ...S.cardHeader, cursor: "pointer" }} onClick={() => setPage("rapports")}>
                      <Icon d={ic.rapports} size={16} stroke="#8e44ad" />
                      <span style={S.cardTitle}>Rapports & Finances</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#1a5c9e", fontWeight: 600 }}>Voir tout →</span>
                    </div>
                    {(() => {
                      const now = new Date();
                      const annee = now.getFullYear();
                      const totalAnnee = depenses.filter(d => new Date(d.date).getFullYear() === annee).reduce((s,d) => s+(d.montant||0), 0);
                      const totalMois = depenses.filter(d => { const dt = new Date(d.date); return dt.getFullYear()===annee && dt.getMonth()===now.getMonth(); }).reduce((s,d) => s+(d.montant||0), 0);
                      const devisPaye = devisList.filter(d => d.statut === "Payé").reduce((s,d) => s+(d.total_ttc||0), 0);
                      return [
                        { label: "Dépenses annuelles", value: totalAnnee.toLocaleString("fr-FR") + " FCFA", color: "#c0392b" },
                        { label: "Dépenses du mois", value: totalMois.toLocaleString("fr-FR") + " FCFA", color: "#c17f2a" },
                        { label: "Devis encaissés", value: devisPaye.toLocaleString("fr-FR", {maximumFractionDigits:0}) + " FCFA", color: "#1a7a4a" },
                      ].map((r, i) => (
                        <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderBottom: "1px solid #f0f4fa" }}>
                          <span style={{ fontSize: 12, color: "#6b8aaa" }}>{r.label}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: r.color }}>{r.value}</span>
                        </div>
                      ));
                    })()}
                  </div>

                  {/* Aperçu Documents */}
                  <div className="card-hover" style={S.card}>
                    <div style={{ ...S.cardHeader, cursor: "pointer" }} onClick={() => setPage("documents")}>
                      <Icon d={ic.docs} size={16} stroke="#2980b9" />
                      <span style={S.cardTitle}>Documents récents</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#1a5c9e", fontWeight: 600 }}>Voir tout →</span>
                    </div>
                    {[
                      { nom: "Bilan annuel 2025", type: "Bilan", date: "15/04/2026", color: "#c0392b" },
                      { nom: "Liasse fiscale Q1", type: "Fiscal", date: "10/04/2026", color: "#c17f2a" },
                      { nom: "Contrat mission", type: "Contrat", date: "02/04/2026", color: "#1a5c9e" },
                    ].map((d, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f4fa" }}>
                        <div style={{ width: 28, height: 28, borderRadius: 7, background: d.color + "18", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                          <Icon d={ic.docs} size={13} stroke={d.color} />
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{d.nom}</div>
                          <div style={{ fontSize: 10, color: "#8da4c0" }}>{d.date}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 7px", borderRadius: 6, background: d.color + "18", color: d.color }}>{d.type}</span>
                      </div>
                    ))}
                  </div>

                  {/* Aperçu Collaborateurs */}
                  <div className="card-hover" style={S.card}>
                    <div style={{ ...S.cardHeader, cursor: "pointer" }} onClick={() => setPage("collab")}>
                      <Icon d={ic.collab} size={16} stroke="#1a7a4a" />
                      <span style={S.cardTitle}>Équipe du cabinet</span>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: "#1a5c9e", fontWeight: 600 }}>Voir tout →</span>
                    </div>
                    {[
                      { nom: "Pierre WILLA SOUMAI", role: "Expert-comptable", initials: "PW", color: "#1a5c9e", statut: "Associé" },
                      { nom: "Sophie Morel", role: "Collaboratrice senior", initials: "SM", color: "#1a7a4a", statut: "CDI" },
                      { nom: "Thomas Bernard", role: "Collaborateur", initials: "TB", color: "#c17f2a", statut: "CDI" },
                    ].map((c, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "8px 0", borderBottom: "1px solid #f0f4fa" }}>
                        <div style={{ width: 30, height: 30, borderRadius: "50%", background: c.color, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontWeight: 700, fontSize: 11, flexShrink: 0 }}>{c.initials}</div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: 12, fontWeight: 600, color: "#1e3a57" }}>{c.nom}</div>
                          <div style={{ fontSize: 11, color: "#8da4c0" }}>{c.role}</div>
                        </div>
                        <span style={{ fontSize: 10, fontWeight: 600, padding: "2px 8px", borderRadius: 20, background: c.statut === "Associé" ? "#e8f0fb" : "#e8f5ee", color: c.statut === "Associé" ? "#1a5c9e" : "#1a7a4a" }}>{c.statut}</span>
                      </div>
                    ))}
                  </div>

                </div>
              </div>
            )}
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
                        <button onClick={() => updateDevis(editingDevisId, "Enregistré")} disabled={devisSaving} style={{ ...S.primaryBtn, background: "#1a7a4a" }}>
                          <Icon d={ic.check} size={14} stroke="#fff" />{devisSaving ? "…" : "Mettre à jour"}
                        </button>
                      ) : (
                        <button onClick={() => saveDevis("Enregistré")} disabled={devisSaving} style={S.primaryBtn}>
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
                    <button onClick={() => { setNewAbonnement({ client: clients[0]?.nom || "", service: "", montant: "", frequence: "Mensuel", date_debut: new Date().toISOString().split("T")[0], prochaine_echeance: "", statut: "Actif", note: "" }); setShowAddAbonnement(true); }} style={S.primaryBtn}>
                      <Icon d={ic.plus} size={14} stroke="#fff" /> Nouvel abonnement
                    </button>
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
                            {a.statut === "Actif" && <button title="Suspendre" onClick={() => toggleAbonnementStatut(a, "Suspendu")} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #f0d080", background: "#fff8e6", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>⏸</button>}
                            {a.statut === "Suspendu" && <button title="Réactiver" onClick={() => toggleAbonnementStatut(a, "Actif")} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #c3e6cb", background: "#e8f5ee", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>▶️</button>}
                            {a.statut !== "Résilié" && <button title="Résilier" onClick={() => { if(window.confirm("Résilier cet abonnement ?")) toggleAbonnementStatut(a, "Résilié"); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12 }}>🚫</button>}
                            {a.statut === "Résilié" && <button title="Supprimer" onClick={() => { if(window.confirm("Supprimer définitivement ?")) deleteAbonnement(a.id); }} style={{ width: 28, height: 28, borderRadius: 6, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={13} stroke="#c0392b" /></button>}
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
                    <button onClick={() => { setNewService({ nom: "", description: "", tarif: "", unite: "forfait", groupe: "Assistance Comptable", actif: true }); setShowAddService(true); }} style={S.primaryBtn}>
                      <Icon d={ic.plus} size={14} stroke="#fff" /> Nouveau service
                    </button>
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
                                  <button onClick={() => { setEditService(item); setShowEditService(true); }} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #e2eaf4", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                    <Icon d={ic.trend} size={12} stroke="#1a5c9e" />
                                  </button>
                                  {item.id && <button onClick={() => deleteService(item.id)} style={{ width: 26, height: 26, borderRadius: 6, border: "1px solid #fde8e8", background: "#fff5f5", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon d={ic.trash} size={12} stroke="#c0392b" /></button>}
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
                    <div style={{ fontSize: 13, fontWeight: 700, color: "#1a5c9e", marginBottom: 10 }}>📦 Archiver les devis d'une année</div>
                    <div style={{ fontSize: 11, color: "#6b8aaa", marginBottom: 12 }}>Supprime tous les devis non-Payés d'une année sélectionnée. Les devis Payés sont conservés.</div>
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
            {navItems.filter(item => ["dashboard", "clients", "services", "depenses", "devis", "rapports"].includes(item.id)).map(item => (
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
                  <div style={{ fontSize: 11, color: "#6b8aaa", maxWidth: 240, lineHeight: 1.5 }}>Centrale des Associés - Conseils & Expertise Comptable et Fiscale</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 18, fontWeight: 800, color: "#1e3a57" }}>DEVIS</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#1a5c9e" }}>{previewDevis.num}</div>
                  <div style={{ fontSize: 12, color: "#6b8aaa", marginTop: 4 }}>Date : {previewDevis.date ? new Date(previewDevis.date).toLocaleDateString("fr-FR") : new Date().toLocaleDateString("fr-FR")}</div>
                </div>
              </div>

              {/* Infos client */}
              <div style={{ background: "#f5f8fc", borderRadius: 10, padding: "16px 20px", marginBottom: 24 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: "#8da4c0", textTransform: "uppercase", marginBottom: 8, letterSpacing: 0.5 }}>Client</div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1e3a57" }}>{previewDevis.client}</div>
                {previewDevis.clientData?.secteur && <div style={{ fontSize: 12, color: "#6b8aaa", marginTop: 2 }}>Secteur : {previewDevis.clientData.secteur}</div>}
              </div>

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
                CGA-CDA — Centrale des Associés - Conseils & Expertise Comptable et Fiscale<br/>
                Devis valable 30 jours à compter de la date d'émission
              </div>
            </div>
          </div>
        </div>
      )}


      {showAddAbonnement && (
        <Modal title="Nouvel abonnement" onClose={() => setShowAddAbonnement(false)}>
          <div style={S.formGroup}>
            <label style={S.label}>Client *</label>
            <select value={newAbo.client} onChange={e => setNewAbo(p => ({ ...p, client: e.target.value }))} style={S.select}>
              {clients.map(c => <option key={c.id}>{c.nom}</option>)}
            </select>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Service souscrit *</label>
            <input placeholder="Ex: Tenue comptable mensuelle..." value={newAbo.service} onChange={e => setNewAbo(p => ({ ...p, service: e.target.value }))} style={S.input} />
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Montant (FCFA) *</label>
              <input type="number" placeholder="0" value={newAbo.montant} onChange={e => setNewAbo(p => ({ ...p, montant: e.target.value }))} style={S.input} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Fréquence</label>
              <select value={newAbo.frequence} onChange={e => setNewAbo(p => ({ ...p, frequence: e.target.value }))} style={S.select}>
                {["Mensuel", "Trimestriel", "Annuel"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Date de début</label>
              <input type="date" value={newAbo.date_debut} onChange={e => setNewAbo(p => ({ ...p, date_debut: e.target.value }))} style={S.select} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Statut</label>
              <select value={newAbo.statut} onChange={e => setNewAbo(p => ({ ...p, statut: e.target.value }))} style={S.select}>
                {["Actif", "Suspendu"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowAddAbonnement(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
            <button onClick={addAbonnement} style={S.primaryBtn}>Enregistrer</button>
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
            <label style={S.label}>Service souscrit *</label>
            <select value={newAbo.service} onChange={e => setNewAbo(p => ({ ...p, service: e.target.value }))} style={S.select}>
              <option value="">-- Sélectionner --</option>
              {["Assistance Comptable","Assistance Fiscale","Assistance Sociale","Assistance Juridique"].map(g => (
                <optgroup key={g} label={g}>
                  {services.filter(s => s.groupe === g).map(s => <option key={s.id}>{s.nom}</option>)}
                </optgroup>
              ))}
            </select>
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
          <div style={{ display: "flex", gap: 12 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Date de début</label>
              <input type="date" value={newAbo.date_debut} onChange={e => setNewAbo(p => ({ ...p, date_debut: e.target.value }))} style={S.select} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Statut</label>
              <select value={newAbo.statut} onChange={e => setNewAbo(p => ({ ...p, statut: e.target.value }))} style={S.select}>
                {["Actif","Suspendu"].map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
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


      {showAddAbonnement && (
        <Modal title="Nouvel abonnement" onClose={() => setShowAddAbonnement(false)}>
          <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
            <div style={S.formGroup}>
              <label style={S.label}>Client *</label>
              <select value={newAbonnement.client} onChange={e => setNewAbonnement(p => ({ ...p, client: e.target.value }))} style={S.select}>
                {clients.map(c => <option key={c.id}>{c.nom}</option>)}
              </select>
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Fréquence</label>
              <select value={newAbonnement.frequence} onChange={e => setNewAbonnement(p => ({ ...p, frequence: e.target.value }))} style={S.select}>
                {["Mensuel", "Trimestriel", "Semestriel", "Annuel"].map(f => <option key={f}>{f}</option>)}
              </select>
            </div>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Service souscrit *</label>
            <select value={newAbonnement.service} onChange={e => setNewAbonnement(p => ({ ...p, service: e.target.value }))} style={S.select}>
              <option value="">-- Sélectionner --</option>
              {["Assistance Comptable","Assistance Fiscale","Assistance Sociale","Assistance Juridique"].map(g => (
                <optgroup key={g} label={g}>
                  {services.filter(s => s.groupe === g).map(s => <option key={s.id}>{s.nom}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div style={{ display: "flex", gap: 12 }}>
            <div style={S.formGroup}>
              <label style={S.label}>Montant (FCFA) *</label>
              <input type="number" placeholder="0" value={newAbonnement.montant} onChange={e => setNewAbonnement(p => ({ ...p, montant: e.target.value }))} style={S.input} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Date de début</label>
              <input type="date" value={newAbonnement.date_debut} onChange={e => setNewAbonnement(p => ({ ...p, date_debut: e.target.value }))} style={S.select} />
            </div>
            <div style={S.formGroup}>
              <label style={S.label}>Prochaine échéance</label>
              <input type="date" value={newAbonnement.prochaine_echeance} onChange={e => setNewAbonnement(p => ({ ...p, prochaine_echeance: e.target.value }))} style={S.select} />
            </div>
          </div>
          <div style={S.formGroup}>
            <label style={S.label}>Note (optionnel)</label>
            <input placeholder="Remarque sur l'abonnement..." value={newAbonnement.note} onChange={e => setNewAbonnement(p => ({ ...p, note: e.target.value }))} style={S.input} />
          </div>
          <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 20 }}>
            <button onClick={() => setShowAddAbonnement(false)} style={{ padding: "9px 16px", borderRadius: 9, background: "#f0f4fa", color: "#4a6d8c", border: "1px solid #e2eaf4", cursor: "pointer", fontSize: 13 }}>Annuler</button>
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
  overlay: { position: "fixed", inset: 0, background: "rgba(15,39,68,.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 },
  modal: { background: "#fff", borderRadius: 16, padding: "24px 28px", width: 480, maxWidth: "92vw", boxShadow: "0 20px 60px rgba(0,0,0,.2)", maxHeight: "90vh", overflowY: "auto" },
  modalHeader: { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 },
  modalTitle: { fontSize: 16, fontWeight: 700, color: "#1e3a57" },
};
