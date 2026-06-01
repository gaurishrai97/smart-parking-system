const API_BASE =
  window.location.hostname === "localhost"
    ? "http://localhost:5000/api"
    : "https://smart-parking-api-aomu.onrender.com/api";

const getToken = () => localStorage.getItem("sps_token");
const getUser = () => JSON.parse(localStorage.getItem("sps_user");

window.Auth = {
  async login(email, password) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    localStorage.setItem("sps_token", data.token);
    localStorage.setItem("sps_user", JSON.stringify(data.user));

    return data.user;
  },

  async register(payload) {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();

    if (!res.ok) throw new Error(data.message);

    localStorage.setItem("sps_token", data.token);
    localStorage.setItem("sps_user", JSON.stringify(data.user));

    return data.user;
  },

  isLoggedIn() {
    return !!getToken();
  },
};
