// =============================================
// CONFIG — change BASE_URL when you deploy
// =============================================
const API_BASE = window.location.hostname === "localhost"
  ? "http://localhost:5000/api"
  :  "https://smart-parking-api-aomu.onrender.com/api";← update after deploying backend

// ---- Helpers ----
const getToken = () => localStorage.getItem("sps_token");
const getUser  = () => JSON.parse(localStorage.getItem("sps_user") || "null");

const authHeaders = () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${getToken()}`,
});

async function apiFetch(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, options);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "API error");
  return data;
}

// ---- Auth ----
const Auth = {
  async register(payload) {
    const data = await apiFetch("/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    localStorage.setItem("sps_token", data.token);
    localStorage.setItem("sps_user", JSON.stringify(data));
    return data;
  },
  async login(email, password) {
    const data = await apiFetch("/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem("sps_token", data.token);
    localStorage.setItem("sps_user", JSON.stringify(data));
    return data;
  },
  logout() {
    localStorage.removeItem("sps_token");
    localStorage.removeItem("sps_user");
    window.location.href = "/index.html";
  },
  isLoggedIn: () => !!getToken(),
  isAdmin: () => getUser()?.role === "admin",
};

// ---- Slots ----
const Slots = {
  getAll:       () => apiFetch("/slots"),
  getAvailable: () => apiFetch("/slots/available"),
  getStats:     () => apiFetch("/slots/stats"),
  seed:         () => apiFetch("/slots/seed", { method: "POST", headers: authHeaders() }),
  update: (id, body) => apiFetch(`/slots/${id}`, { method: "PUT", headers: authHeaders(), body: JSON.stringify(body) }),
  create: (body)     => apiFetch("/slots",    { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }),
  delete: (id)       => apiFetch(`/slots/${id}`, { method: "DELETE", headers: authHeaders() }),
};

// ---- Bookings ----
const Bookings = {
  create:   (body) => apiFetch("/bookings",    { method: "POST", headers: authHeaders(), body: JSON.stringify(body) }),
  checkout: (id)   => apiFetch(`/bookings/${id}/checkout`, { method: "PUT", headers: authHeaders() }),
  my:       ()     => apiFetch("/bookings/my", { headers: authHeaders() }),
  all:      ()     => apiFetch("/bookings",    { headers: authHeaders() }),
  stats:    ()     => apiFetch("/bookings/stats", { headers: authHeaders() }),
  cancel:   (id)   => apiFetch(`/bookings/${id}`, { method: "DELETE", headers: authHeaders() }),
};

// ---- Admin ----
const Admin = {
  getUsers:   ()           => apiFetch("/admin/users", { headers: authHeaders() }),
  setRole:    (id, role)   => apiFetch(`/admin/users/${id}/role`, { method: "PUT", headers: authHeaders(), body: JSON.stringify({ role }) }),
  deleteUser: (id)         => apiFetch(`/admin/users/${id}`, { method: "DELETE", headers: authHeaders() }),
};
