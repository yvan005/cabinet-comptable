// Configuration et helpers Supabase : URL, clés, et fonctions db/auth/storage

// ── SUPABASE CONFIG ──────────────────────────────────────────────────────────
const SUPABASE_URL = "https://egnhdnuquirsngwokwmy.supabase.co";
const SUPABASE_KEY = "sb_publishable_fBzLhJdEDbP0DGRvfZXy0Q_yo3OMpIz";
// ⚠️ La clé service_role a été retirée d'ici : elle vit désormais uniquement
// côté serveur, dans la variable d'environnement SUPABASE_SERVICE_ROLE_KEY
// de l'Edge Function "delete-collaborator". Ne jamais la remettre dans ce fichier.

const db = {
  async get(table, params = "") {
    if (!SUPABASE_URL || !SUPABASE_KEY) { console.error("Variables Supabase manquantes"); return []; }
    const session = auth.getSession();
    const token = session?.access_token || SUPABASE_KEY;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?order=created_at.desc${params}`, {
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
    });
    if (!res.ok) return [];
    return res.json();
  },
  async post(table, body) {
    const session = auth.getSession();
    const token = session?.access_token || SUPABASE_KEY;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(body)
    });
    return res.json().catch(() => ({}));
  },
  async patch(table, id, body) {
    const session = auth.getSession();
    const token = session?.access_token || SUPABASE_KEY;
    const res = await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "PATCH",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json", Prefer: "return=representation" },
      body: JSON.stringify(body)
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      console.error(`PATCH ${table} failed:`, res.status, err);
    }
    return res.json().catch(() => ({}));
  },
  async delete(table, id) {
    const session = auth.getSession();
    const token = session?.access_token || SUPABASE_KEY;
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?id=eq.${id}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
    });
  },
  async deleteWhere(table, col, val) {
    const session = auth.getSession();
    const token = session?.access_token || SUPABASE_KEY;
    await fetch(`${SUPABASE_URL}/rest/v1/${table}?${col}=eq.${encodeURIComponent(val)}`, {
      method: "DELETE",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}` }
    });
  }
};

// Le bucket "documents" est désormais privé : on ne peut plus ouvrir
// doc.url directement, il faut générer une URL signée et temporaire
// à chaque ouverture, avec le token de l'utilisateur connecté.
const storage = {
  async getSignedUrl(path, expiresIn = 3600) {
    const session = auth.getSession();
    const token = session?.access_token || SUPABASE_KEY;
    const res = await fetch(`${SUPABASE_URL}/storage/v1/object/sign/documents/${path}`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ expiresIn })
    });
    const data = await res.json().catch(() => ({}));
    return data.signedURL ? `${SUPABASE_URL}/storage/v1${data.signedURL}` : null;
  },
  async openDoc(doc) {
    if (!doc?.storage_path) { alert("Document sans fichier associé (ancien document uploadé avant la migration du bucket)."); return; }
    const url = await this.getSignedUrl(doc.storage_path);
    if (url) window.open(url, "_blank", "noopener,noreferrer");
    else alert("Impossible d'ouvrir ce document (accès refusé ou fichier introuvable).");
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
  clearSession() { localStorage.removeItem("sb_session"); },
  async refreshSession(refreshToken) {
    const res = await fetch(`${SUPABASE_URL}/auth/v1/token?grant_type=refresh_token`, {
      method: "POST",
      headers: { apikey: SUPABASE_KEY, "Content-Type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken })
    });
    return res.json();
  },
  // Permet à l'utilisateur connecté de changer SON PROPRE mot de passe
  // (endpoint self-service standard de Supabase Auth, pas besoin de droits admin).
  async updatePassword(newPassword) {
    const session = this.getSession();
    const token = session?.access_token;
    if (!token) return { error: { message: "Non connecté" } };
    const res = await fetch(`${SUPABASE_URL}/auth/v1/user`, {
      method: "PUT",
      headers: { apikey: SUPABASE_KEY, Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({ password: newPassword })
    });
    const data = await res.json();
    if (!res.ok) return { error: { message: data.msg || data.error_description || data.message || "Erreur lors du changement de mot de passe" } };
    return { data };
  }
};

export { SUPABASE_URL, SUPABASE_KEY, db, auth, storage };
