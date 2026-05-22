import axios from "axios";

const explicitApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl =
  import.meta.env.VITE_API_BASE_URL ||
  import.meta.env.VITE_BACKEND_URL ||
  "http://localhost:5000";

const http = axios.create({
  baseURL: explicitApiUrl
    ? explicitApiUrl.replace(/\/$/, "")
    : `${apiBaseUrl.replace(/\/$/, "")}/api`,
  timeout: 20000,
});

function apiErrorMessage(err) {
  return err?.response?.data?.error?.message || err?.message || "Request failed";
}

function adminAuthHeader() {
  const token = localStorage.getItem("adminToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function fetchPendingWorkers() {
  try {
    const res = await http.get("/admin/workers/pending", { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchWorkers() {
  try {
    const res = await http.get("/admin/workers", { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchEmployers() {
  try {
    const res = await http.get("/admin/employers", { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function trashEmployer(id) {
  try {
    const res = await http.post(`/admin/employers/${id}/trash`, null, { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function restoreEmployer(id) {
  try {
    const res = await http.post(`/admin/employers/${id}/restore`, null, { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchAdminJobs() {
  try {
    const res = await http.get("/admin/jobs", { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function trashAdminJob(id) {
  try {
    const res = await http.post(`/admin/jobs/${id}/trash`, null, { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function restoreAdminJob(id) {
  try {
    const res = await http.post(`/admin/jobs/${id}/restore`, null, { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchAdminWallet() {
  try {
    const res = await http.get("/admin/wallet", { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function wipeDatabase(confirm) {
  try {
    const res = await http.post(
      "/admin/db/wipe",
      { confirm },
      { headers: adminAuthHeader() }
    );
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function approveWorkerProfile(id) {
  try {
    const res = await http.post(`/admin/workers/${id}/profile-approve`, null, { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function rejectWorkerProfile(id) {
  try {
    const res = await http.post(`/admin/workers/${id}/profile-reject`, null, { headers: adminAuthHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}
