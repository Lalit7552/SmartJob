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

function setEmployerTokens({ kind, token }) {
  if (kind === "auth") {
    localStorage.setItem("employerAuthToken", token);
    localStorage.removeItem("employerOnboardingToken");
  } else if (kind === "onboarding") {
    localStorage.setItem("employerOnboardingToken", token);
  }
}

export async function requestEmployerOtp({ phone, countryCode = "+91" }) {
  try {
    const res = await http.post("/employer/signup/request-otp", { phone, countryCode });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function verifyEmployerOtp({ phone, otp, countryCode = "+91" }) {
  try {
    const res = await http.post("/employer/signup/verify-otp", { phone, otp, countryCode });
    if (res.data?.ok && res.data?.data?.session?.token) {
      setEmployerTokens(res.data.data.session);
    }
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

function onboardingAuthHeader() {
  const token = localStorage.getItem("employerOnboardingToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

function authHeader() {
  const token = localStorage.getItem("employerAuthToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function saveEmployerProfile(profile) {
  try {
    const isFormData = typeof profile?.append === "function";
    const res = await http.post("/employer/onboarding/profile", profile, {
      headers: {
        ...onboardingAuthHeader(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
    if (res.data?.ok && res.data?.data?.session?.token) {
      setEmployerTokens(res.data.data.session);
    }
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchApprovedWorkers() {
  try {
    const res = await http.get("/employer/workers", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function upsertWorkerRating(workerId, payload) {
  try {
    const res = await http.post(
      `/employer/workers/${workerId}/ratings`,
      payload,
      { headers: authHeader() }
    );
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchEmployerProfile() {
  try {
    const res = await http.get("/employer/me", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function updateEmployerProfile(profile) {
  try {
    const isFormData = typeof profile?.append === "function";
    const res = await http.put("/employer/profile", profile, {
      headers: {
        ...authHeader(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function createEmployerJob(job) {
  try {
    const res = await http.post("/employer/jobs", job, { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchEmployerJobs() {
  try {
    const res = await http.get("/employer/jobs", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchEmployerEnquiries() {
  try {
    const res = await http.get("/employer/enquiries", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function generateEnquiryOtp(enquiryId) {
  try {
    const res = await http.post(
      `/employer/enquiries/${enquiryId}/otp`,
      {},
      { headers: authHeader() }
    );
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function deleteEmployerJob(jobId) {
  try {
    const res = await http.delete(`/employer/jobs/${jobId}`, { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}
