console.log("auth.js loaded");

const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://smart-parking-api-aomu.onrender.com/api";

// Save token & user
function saveAuth(token, user) {
  localStorage.setItem("sps_token", token);
  localStorage.setItem("sps_user", JSON.stringify(user));
}

// Get token
function getToken() {
  return localStorage.getItem("sps_token");
}

// Get user
function getUser() {
  return JSON.parse(localStorage.getItem("sps_user"));
}

// Auth object
window.Auth = {
  async login(email, password) {
    const response = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Login failed");
    saveAuth(data.token, data.user);
    return data.user;
  },

  async register(payload) {
    const response = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.message || "Signup failed");
    saveAuth(data.token, data.user);
    return data.user;
  },

  isLoggedIn() {
    return !!getToken();
  },

  logout() {
    localStorage.removeItem("sps_token");
    localStorage.removeItem("sps_user");
    window.location.href = "/index.html";
  },
};
