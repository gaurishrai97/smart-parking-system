const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://smart-parking-api-aomu.onrender.com/api";

// ── helpers ──────────────────────────────────────────────
function getToken()  { return localStorage.getItem("sps_token"); }
function getUser()   { try { return JSON.parse(localStorage.getItem("sps_user")); } catch{ return null; } }
function saveAuth(token, user) {
  localStorage.setItem("sps_token", token);
  localStorage.setItem("sps_user", JSON.stringify(user));
}

async function req(path, options = {}) {
  const token = getToken();
  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || `Request failed (${res.status})`);
  return data;
}

// Extract user from any backend response shape
// Handles: {token, user}, {token, data}, {token, name, email, ...}
function extractUser(data) {
  if (data.user && typeof data.user === "object") return data.user;
  if (data.data && typeof data.data === "object") return data.data;
  // backend returned flat user fields alongside token
  const { token, ...rest } = data;
  if (rest.name || rest.email) return rest;
  return data;
}

// ── Auth ─────────────────────────────────────────────────
window.Auth = {
  async login(email, password) {
    const data = await req("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    const user = extractUser(data);
    saveAuth(data.token, user);
    return user;
  },

  async register(payload) {
    const data = await req("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    });
    const user = extractUser(data);
    saveAuth(data.token, user);
    return user;
  },

  isLoggedIn() { return !!getToken(); },

  isAdmin() {
    const u = getUser();
    return u?.role === "admin";
  },

  logout() {
    localStorage.removeItem("sps_token");
    localStorage.removeItem("sps_user");
    window.location.href = "/index.html";
  },
};

// ── Slots ─────────────────────────────────────────────────
window.Slots = {
  getAll()            { return req("/slots"); },
  getAvailable()      { return req("/slots/available"); },
  getStats()          { return req("/slots/stats"); },
  create(payload)     { return req("/slots", { method: "POST", body: JSON.stringify(payload) }); },
  update(id, payload) { return req(`/slots/${id}`, { method: "PUT", body: JSON.stringify(payload) }); },
  delete(id)          { return req(`/slots/${id}`, { method: "DELETE" }); },
  seed()              { return req("/slots/seed", { method: "POST" }); },
};

// ── Bookings ──────────────────────────────────────────────
window.Bookings = {
  my()            { return req("/bookings/my"); },
  all()           { return req("/bookings"); },
  create(payload) { return req("/bookings", { method: "POST", body: JSON.stringify(payload) }); },
  checkout(id)    { return req(`/bookings/${id}/checkout`, { method: "PUT" }); },
  cancel(id)      { return req(`/bookings/${id}/cancel`, { method: "PUT" }); },
};

// ── Admin ─────────────────────────────────────────────────
window.Admin = {
  getStats()        { return req("/admin/stats"); },
  getUsers()        { return req("/admin/users"); },
  setRole(id, role) { return req(`/admin/users/${id}/role`, { method: "PUT", body: JSON.stringify({ role }) }); },
  deleteUser(id)    { return req(`/admin/users/${id}`, { method: "DELETE" }); },
};
