// ---- Toast ----
function showToast(msg, type = "success") {
  let container = document.getElementById("toast-container");
  if (!container) {
    container = document.createElement("div");
    container.id = "toast-container";
    document.body.appendChild(container);
  }
  const icon = type === "success" ? "✅" : type === "error" ? "❌" : "ℹ️";
  const toast = document.createElement("div");
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `<span>${icon}</span><span>${msg}</span>`;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3500);
}

// ---- Guard pages ----
function requireAuth() {
  if (!Auth.isLoggedIn()) { window.location.href = "/index.html"; return false; }
  return true;
}
function requireAdmin() {
  if (!Auth.isAdmin()) { window.location.href = "/pages/dashboard.html"; return false; }
  return true;
}

// ---- Render navbar user ----
function renderNavUser() {
  const user = getUser();
  const el = document.getElementById("nav-user");
  if (!el) return;
  if (user) {
    el.innerHTML = `
      <div class="nav-user">
        <div class="avatar">${user.name?.[0]?.toUpperCase() || "U"}</div>
        <span style="font-size:0.875rem">${user.name}</span>
        ${user.role === "admin" ? `<span class="badge badge-admin">Admin</span>` : ""}
        <button class="btn btn-secondary btn-sm" onclick="Auth.logout()">Logout</button>
      </div>`;
  } else {
    el.innerHTML = `<a href="/index.html" class="btn btn-primary btn-sm">Login</a>`;
  }
}

// ---- Format helpers ----
function fmtDate(d) { return d ? new Date(d).toLocaleString() : "—"; }
function fmtCurrency(n) { return "₹" + Number(n || 0).toFixed(2); }
function fmtDuration(h) { return h ? `${h}h` : "—"; }

// ---- Slot type icons ----
const slotIcons = { regular: "🚗", premium: "⭐", handicapped: "♿", ev: "⚡" };
function slotIcon(type) { return slotIcons[type] || "🚗"; }

document.addEventListener("DOMContentLoaded", renderNavUser);
