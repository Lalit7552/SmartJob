import { Zap, MapPin, ShieldCheck, Menu, Phone, Mail, Calendar, Edit, Building } from "lucide-react";
import { useContext, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { EmployeeLayoutContext } from "./EmployeeLayoutContext";
import { fetchEmployerProfile } from "../../api/employerApi";

export default function EmployeeProfile() {
  const { openSidebar } = useContext(EmployeeLayoutContext);
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProfile() {
      try {
        const res = await fetchEmployerProfile();
        const user = res?.data?.data?.user || res?.data?.user || null;
        const payload = user?.profile || res?.data?.profile || res?.profile || null;
        if (!payload && !user) {
          setProfile(null);
          return;
        }
        setProfile({
          ...(payload || {}),
          phone: user?.phone || payload?.phone,
          email: user?.email || payload?.email,
        });
      } catch (err) {
        console.error("Error loading profile");
      } finally {
        setLoading(false);
      }
    }
    loadProfile();
  }, []);

  const summary = useMemo(() => {
    const baseURL =
      import.meta.env.VITE_API_BASE_URL ||
      import.meta.env.VITE_BACKEND_URL ||
      "http://localhost:5000";
    const normalizeUrl = (value) => {
      if (!value) return null;
      if (value.startsWith("http")) return value;
      return `${baseURL.replace(/\/$/, "")}${value.startsWith("/") ? "" : "/"}${value}`;
    };
    return {
      name: profile?.name || "Not Set",
      companyName: profile?.companyName || "No Company Name",
      city: profile?.city || "City Not Added",
      address: profile?.address || "No Address Provided",
      year: profile?.establishedYear || "N/A",
      phone: profile?.phone || "No Phone",
      email: profile?.email || "No Email",
      img: normalizeUrl(profile?.profilePhoto),
    };
  }, [profile]);

  if (loading) return <div className="h-screen flex items-center justify-center bg-[#0a0f0d] text-emerald-500 font-bold tracking-widest uppercase text-xs">Loading...</div>;

 return (
  <div className="min-h-screen bg-[#0a0f0d] text-white flex flex-col items-center pt-10 px-4">

    {/* Top Profile */}
    <div className="flex flex-col items-center text-center">

      {/* Image */}
      <div className="w-36 h-36 rounded-full overflow-hidden ring-4 ring-emerald-500/30 bg-emerald-500/10">
        {summary.img ? (
          <img src={summary.img} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-emerald-400">
            <Building size={40} />
          </div>
        )}
      </div>

      {/* Name */}
      <h1 className="mt-4 text-2xl font-bold">{summary.name} {summary.companyName}</h1>

     

      {/* Buttons */}
      <div className="flex gap-3 mt-4">
        <button
          onClick={() => navigate("/employee-profileform")}
          className="px-5 py-2 bg-emerald-500 text-black rounded-lg text-sm font-semibold hover:scale-105 transition"
        >
          Edit Profile
        </button>

       
      </div>
    </div>

    {/* Details Cards */}
    <div className="w-full max-w-md mt-8 flex flex-col gap-6">

      {/* Contact */}
      <div className="bg-[#111815] rounded-2xl p-5 border border-white/5">
        <p className="text-xs text-emerald-400 mb-4 uppercase">Contact</p>

        <p className="text-sm">
          <span className="text-slate-400">Email:</span> {summary.email}
        </p>
        <p className="text-sm">
          <span className="text-slate-400">Phone:</span> {summary.phone}
        </p>
      </div>

      {/* Location */}
      <div className="bg-[#111815] rounded-2xl p-5 border border-white/5">
        <p className="text-xs text-blue-400 mb-4 uppercase">Location</p>

        <p className="text-sm">
          <span className="text-slate-400">City:</span> {summary.city}
        </p>
        <p className="text-sm">
          <span className="text-slate-400">Address:</span> {summary.address}
        </p>
      </div>


    </div>
  </div>
);
}
