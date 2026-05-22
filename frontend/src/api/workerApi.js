import axios from "axios";

const explicitApiUrl = import.meta.env.VITE_API_URL;
const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || import.meta.env.VITE_BACKEND_URL || "http://localhost:5000";

const http = axios.create({
  baseURL: explicitApiUrl ? explicitApiUrl.replace(/\/$/, "") : `${apiBaseUrl.replace(/\/$/, "")}/api`,
  timeout: 20000,
});

function apiErrorMessage(err) {
  return (
    err?.response?.data?.error?.message ||
    err?.message ||
    "Request failed"
  );
}

function setWorkerTokens({ kind, token }) {
  if (kind === "auth") {
    localStorage.setItem("workerAuthToken", token);
    localStorage.removeItem("workerOnboardingToken");
  } else if (kind === "onboarding") {
    localStorage.setItem("workerOnboardingToken", token);
    localStorage.removeItem("workerAuthToken");
  }
}

export async function requestWorkerOtp({ phone, countryCode = "+91" }) {
  try {
    const res = await http.post("/worker/signup/request-otp", { phone, countryCode });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function verifyWorkerOtp({ phone, otp, countryCode = "+91" }) {
  try {
    const res = await http.post("/worker/signup/verify-otp", { phone, otp, countryCode });
    if (res.data?.ok && res.data?.data?.session?.token) {
      setWorkerTokens(res.data.data.session);
    }
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

function onboardingAuthHeader() {
  const token = localStorage.getItem("workerOnboardingToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function saveWorkerProfile(profile) {
  try {
    const isFormData = typeof profile?.append === "function";
    const res = await http.post("/worker/onboarding/profile", profile, {
      headers: {
        ...onboardingAuthHeader(),
        ...(isFormData ? {} : { "Content-Type": "application/json" }),
      },
    });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function saveWorkerSkills(payload) {
  try {
    const skills = Array.isArray(payload) ? payload : payload?.skills;
    const experience = Array.isArray(payload) ? undefined : payload?.experience;
    const jobType = Array.isArray(payload) ? undefined : payload?.jobType;
    const salary = Array.isArray(payload) ? undefined : payload?.salary;
    const preferredArea = Array.isArray(payload) ? undefined : payload?.preferredArea;
    const res = await http.post(
      "/worker/onboarding/skills",
      { skills, experience, jobType, salary, preferredArea },
      { headers: onboardingAuthHeader() }
    );
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function uploadWorkerDocuments(formData) {
  try {
    const res = await http.post("/worker/onboarding/documents", formData, {
      headers: onboardingAuthHeader(),
    });
    if (res.data?.ok && res.data?.data?.session?.token) {
      setWorkerTokens(res.data.data.session);
    }
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

function authHeader() {
  const token = localStorage.getItem("workerAuthToken");
  if (!token) return {};
  return { Authorization: `Bearer ${token}` };
}

export async function fetchWorkerJobs() {
  try {
    const res = await http.get("/worker/jobs", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchWorkerEnquiries() {
  try {
    const res = await http.get("/worker/enquiries", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchWorkerWallet() {
  try {
    const res = await http.get("/worker/wallet", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function applyToJob(jobId) {
  try {
    const res = await http.post(`/worker/jobs/${jobId}/apply`, {}, { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function verifyEnquiryOtp(enquiryId, otp) {
  try {
    const res = await http.post(
      `/worker/enquiries/${enquiryId}/otp/verify`,
      { otp },
      { headers: authHeader() }
    );
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function completeEnquiryWork(enquiryId, paymentMethod) {
  try {
    const res = await http.post(
      `/worker/enquiries/${enquiryId}/complete`,
      { paymentMethod },
      { headers: authHeader() }
    );
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchWorkerProfile() {
  try {
    const res = await http.get("/worker/me", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function fetchWorkerRatings() {
  try {
    const res = await http.get("/worker/ratings", { headers: authHeader() });
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}

export async function updateWorkerProfile(profile) {
  try {
    const isFormData = typeof profile?.append === "function";
    const res = await http.put("/worker/profile", profile, {
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

export async function updateWorkerSkills(payload) {
  try {
    const skills = Array.isArray(payload) ? payload : payload?.skills;
    const experience = Array.isArray(payload) ? undefined : payload?.experience;
    const jobType = Array.isArray(payload) ? undefined : payload?.jobType;
    const salary = Array.isArray(payload) ? undefined : payload?.salary;
    const preferredArea = Array.isArray(payload) ? undefined : payload?.preferredArea;
    const res = await http.put(
      "/worker/skills",
      { skills, experience, jobType, salary, preferredArea },
      { headers: authHeader() }
    );
    return res.data;
  } catch (err) {
    throw new Error(apiErrorMessage(err));
  }
}
