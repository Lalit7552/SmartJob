import { MapPin, ShieldCheck, Phone, Edit, User, Briefcase, Star, BookOpen, Calendar } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Country, State } from "country-state-city";
import { fetchWorkerProfile } from "../../api/workerApi";

export default function WorkerProfile() {
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    async function loadProfile() {
      try {
        setLoading(true);
        setError("");
        const res = await fetchWorkerProfile();
        const user = res?.data?.data?.user || res?.data?.user || res?.data || null;
        if (alive) setProfile(user);
      } catch (err) {
        if (alive) setError(err?.message || "Failed to load profile");
      } finally {
        if (alive) setLoading(false);
      }
    }
    loadProfile();
    return () => { alive = false; };
  }, []);

  const summary = useMemo(() => {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      "http://localhost:5000";
    const resolveAssetUrl = (value) => {
      if (!value) return null;
      if (/^https?:\/\//i.test(value)) return value;
      return `${baseURL.replace(/\/$/, "")}${value.startsWith("/") ? "" : "/"}${value}`;
    };

    const p = profile?.profile || {};
    const countryData = p?.country ? Country.getCountryByCode(p.country) : null;
    const stateData = p?.state && p?.country ? State.getStateByCodeAndCountry(p.state, p.country) : null;

    return {
      fullName: p?.fullName || "Worker",
      age: p?.age ?? "N/A",
      gender: p?.gender || "N/A",
      countryName: countryData?.name || "Not set",
      stateName: stateData?.name || "Not set",
      city: p?.city || "Not set",
      area: p?.area || "Not set",
      about: p?.about || "No bio added yet.",
      phone: profile?.phone || "No Phone",
      profileStatus: profile?.profileStatus || "pending",
      skills: Array.isArray(profile?.skills) ? profile.skills : [],
      skillDetails: profile?.skillDetails || {},
      documents: Array.isArray(profile?.documents) ? profile.documents : [],
      profilePhoto: resolveAssetUrl(p?.profilePhoto),
    };
  }, [profile]);

  const initials = summary.fullName
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-[#0a0f0d] text-emerald-500 font-bold tracking-widest uppercase text-xs">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0a0f0d]">
        <div className="bg-[#111815] border border-white/5 rounded-3xl p-10 text-center max-w-md">
          <p className="text-emerald-400 font-black text-sm mb-2">Failed to load profile</p>
          <p className="text-slate-400 text-xs">{error}</p>
        </div>
      </div>
    );
  }

  const statusLabel = summary.profileStatus === "approved"
    ? "Verified Worker"
    : summary.profileStatus === "rejected"
      ? "Profile Rejected"
      : "Verification Pending";

  return (
    <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center pt-10 px-4 mb-8">

      {/* Profile Top */}
      <div className="flex flex-col items-center text-center">

        {/* Image */}
        <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-emerald-500/30 bg-emerald-500/10">
          {summary.profilePhoto ? (
            <img src={summary.profilePhoto} className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl font-bold text-emerald-400">
              {initials}
            </div>
          )}
        </div>

        {/* Name */}
        <h1 className="mt-4 text-2xl font-bold">{summary.fullName}</h1>

        <p className="text-sm text-slate-400">
          {summary.about}
        </p>

        {/* Location */}
        <p className="text-sm text-slate-400">
          {summary.city} • {summary.stateName}
        </p>

        {/* Buttons */}
        <div className="flex gap-3 mt-4">
          <button
            onClick={() => navigate("/worker-profile")}
            className="px-5 py-2 bg-emerald-500 text-black rounded-lg text-sm font-semibold hover:scale-105 transition"
          >
            Edit Profile
          </button>


        </div>
      </div>

      {/* Details Section */}
      <div className="w-full max-w-md mt-8 flex flex-col gap-6">

        {/* Contact */}
        <div className="bg-[#111815] rounded-2xl p-5 border border-white/5">
          <p className="text-xs text-emerald-400 mb-4 uppercase">Contact</p>

          <p className="text-sm"><span className="text-slate-400">Phone:</span> {summary.phone}</p>
          <p className="text-sm"><span className="text-slate-400">City:</span> {summary.city}</p>
          <p className="text-sm"><span className="text-slate-400">State:</span> {summary.stateName}</p>
        </div>

        {/* Professional */}
        <div className="bg-[#111815] rounded-2xl p-5 border border-white/5">
          <p className="text-xs text-amber-400 mb-4 uppercase">Professional</p>

          <p className="text-sm"><span className="text-slate-400">Experience:</span> {summary.skillDetails?.experience || "N/A"}</p>
          <p className="text-sm"><span className="text-slate-400">Job Type:</span> {summary.skillDetails?.jobType || "N/A"}</p>

        </div>
        {/* Skills */}
        <div className="bg-[#111815] rounded-2xl p-5 border border-white/5">

          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs text-emerald-400 uppercase">
              Skills ({summary.skills.length})
            </p>

            <button
              onClick={() => navigate("/worker-skills")}
              className="px-4 py-1.5 border border-emerald-500 text-emerald-400 rounded-lg text-xs font-semibold hover:bg-emerald-500/10 transition"
            >
              Add Skills
            </button>
          </div>

          {/* Skills List */}
          {summary.skills.length ? (
            <div className="flex flex-wrap gap-2">
              {summary.skills.map((skill) => (
                <span
                  key={skill}
                  className="px-3 py-1 rounded-full text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                >
                  {skill}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-400">No skills added</p>
          )}
        </div>

      </div>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-4 text-sm group">
      <div className="w-8 h-8 rounded-lg bg-white/5 flex items-center justify-center text-slate-400 group-hover:text-emerald-500 transition-colors">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-[10px] text-slate-500 uppercase font-bold">{label}</p>
        <p className="font-semibold truncate">{value}</p>
      </div>
    </div>
  );
}
