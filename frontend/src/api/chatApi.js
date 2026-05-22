import axios from "axios";

const explicitApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const apiRoot = explicitApiUrl
  ? explicitApiUrl.replace(/\/$/, "")
  : `${apiBaseUrl.replace(/\/$/, "")}/api`;

const socketBase = explicitApiUrl
  ? explicitApiUrl.replace(/\/$/, "").replace(/\/api$/, "")
  : apiBaseUrl.replace(/\/$/, "");

const http = axios.create({
  baseURL: apiRoot,
  timeout: 20000,
});

function apiErrorMessage(err) {
  return err?.response?.data?.error?.message || err?.message || "Request failed";
}

function authHeader(role) {
  const token =
    role === "employer"
      ? localStorage.getItem("employerAuthToken")
      : localStorage.getItem("workerAuthToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export function getSocketUrl() {
  return socketBase;
}

export async function fetchChatThreads({ role } = {}) {
  try {
    const res = await http.get("/chat/threads", {
      headers: authHeader(role),
    });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchChatMessages({ workerId, employerId, role, limit = 50, before } = {}) {
  try {
    const params = { workerId, employerId, limit };
    if (before) params.before = before;
    const res = await http.get("/chat/messages", {
      params,
      headers: authHeader(role),
    });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}
