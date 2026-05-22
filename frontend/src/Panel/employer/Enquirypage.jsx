import React, { useEffect, useMemo, useState } from "react";
import { fetchEmployerEnquiries } from "../../api/employerApi";
import {
  MapPin, Phone, User, CheckCircle2, Briefcase,
  IndianRupee, ClipboardList, Calendar, MessageCircle,
  ChevronRight, Star, ShieldCheck
} from "lucide-react";
import { Country, State } from "country-state-city";
import { useNavigate } from "react-router-dom";

export default function Enquirypage() {
  const [enquiries, setEnquiries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetchEmployerEnquiries();
        const data = res?.data?.enquiries || res?.data?.data || res?.data || [];
        setEnquiries(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Employer Enquiries Load Error:", err);
        setError("Failed to load enquiries.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-black text-blue-600 uppercase tracking-widest text-xs">
        Loading Enquiries...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6 md:p-10">
      <div className="max-w-5xl mx-auto">
        {/* Header Section */}
        <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-black tracking-tight text-slate-900">Job Enquiries</h1>
            <p className="text-sm text-slate-500 font-medium mt-1">Workers who applied for your job posts</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2">
            <span className="text-xs font-black text-blue-600 uppercase tracking-wider">{enquiries.length} Total Applications</span>
          </div>
        </div>

        {enquiries.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-[2.5rem] p-20 text-center shadow-sm">
            <ClipboardList size={48} className="mx-auto text-slate-200 mb-4" />
            <p className="text-slate-400 font-bold uppercase text-xs tracking-widest">No enquiries received yet.</p>
          </div>
        ) : (
          <div className="space-y-5">
            {enquiries.map((enquiry, index) => (
              <EnquiryCard key={enquiry?.id || index} enquiry={enquiry} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EnquiryCard({ enquiry }) {
  const navigate = useNavigate();
  const worker = enquiry?.worker || {};
  const profile = worker?.profile || {};
  const skill = worker?.skillDetails || {};
  const job = enquiry?.job || {};

  const phoneNumber = worker?.phone ? `${worker?.countryCode || "+91"}${worker.phone}` : null;

  const location = useMemo(() => {
    const state = profile?.state && profile?.country ? State.getStateByCodeAndCountry(profile.state, profile.country) : null;
    return [profile?.city, state?.name].filter(Boolean).join(", ");
  }, [profile]);

  const skills = useMemo(() => {
    if (Array.isArray(worker.skills)) return worker.skills;
    if (typeof worker.skills === "string") return worker.skills.split(",");
    return [];
  }, [worker]);

  return (
    <div className="bg-white rounded-[2.5rem] border border-slate-200 p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-6 hover:shadow-xl hover:shadow-blue-500/5 transition-all group">

      {/* Left: Worker Profile Info */}
      <div className="flex-1 w-full">
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <h2 className="text-2xl font-black text-slate-900 tracking-tight group-hover:text-blue-600 transition-colors uppercase">
            {profile?.fullName || "Verified Worker"}
          </h2>
          <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase border border-emerald-100 flex items-center gap-1">
            <ShieldCheck size={12} /> {skill?.experience || "Fresher"} Exp
          </span>
          <span className="bg-blue-50 text-blue-700 text-[10px] font-black px-2 py-0.5 rounded-md uppercase border border-blue-100">
            Applied for: {job?.title || "General Job"}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-slate-500 mb-4">
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
            <MapPin size={14} className="text-rose-500" />
            {location || "Location N/A"}
          </div>
          <span className="text-slate-200 hidden md:block">|</span>
          <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-tight">
            <User size={14} className="text-blue-500" />
            {profile?.gender || "Any"} • {profile?.age || "-"} Yrs
          </div>
          <span className="text-slate-200 hidden md:block">|</span>
          <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-black uppercase tracking-tight">
            <IndianRupee size={14} />
            Exp: {skill?.expectedSalary || "Negotiable"}
          </div>
        </div>

        {/* Skills Row */}
        <div className="flex flex-wrap gap-2">
          {skills.length > 0 ? (
            skills.slice(0, 4).map((s, i) => (
              <span key={i} className="px-3 py-1 bg-slate-100 rounded-lg text-[10px] font-black uppercase text-slate-500 tracking-tighter">
                {s.trim()}
              </span>
            ))
          ) : (
            <span className="text-[10px] text-slate-400 font-bold uppercase italic">No specific skills listed</span>
          )}
        </div>
      </div>

      {/* Right: Actions (Matching Find Jobs Style) */}
      <div className="flex items-center gap-3 w-full md:w-auto md:border-l border-slate-100 md:pl-8">


        <button
          onClick={() => navigate(`/employee/chat/${worker?._id}`)}
          className="flex-[2] md:w-36 h-12 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-black uppercase text-[10px] tracking-[0.1em] shadow-lg shadow-blue-500/20 transition-all active:scale-95"
        >
          Chat Now
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
