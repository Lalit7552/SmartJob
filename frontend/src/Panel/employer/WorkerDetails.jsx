import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { fetchApprovedWorkers, upsertWorkerRating } from "../../api/employerApi";
import {
  MapPin,
  Phone,
  User,
  IndianRupee,
  CheckCircle2,
  ArrowLeft,
  Star
} from "lucide-react";
import { Country, State } from "country-state-city";

export default function WorkerDetail() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const workerId = searchParams.get("workerId");

  const [worker, setWorker] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showReview, setShowReview] = useState(false);
  const [rating, setRating] = useState(0);
  const [review, setReview] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const loadWorker = async () => {
      try {
        setLoading(true);
        const res = await fetchApprovedWorkers();
        const workers = res?.data?.workers || [];
        const found = workers.find((w) => String(w.id) === String(workerId));
        setWorker(found);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    loadWorker();
  }, [workerId]);

  const goBack = () => navigate(-1);

  if (loading)
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center font-bold text-blue-600">
        Loading Profile...
      </div>
    );

  if (!worker)
    return (
      <div className="p-10 text-slate-500 bg-slate-50 min-h-screen">
        Worker not found
      </div>
    );

  const profile = worker?.profile || {};
  const skill = worker?.skillDetails || {};
  const ratingSummary = {
    avgRating: worker?.avgRating || 0,
    totalRatings: worker?.totalRatings || 0,
  };

  const baseURL = "http://localhost:5000";

  const profilePhoto = profile?.profilePhoto
    ? `${baseURL}${profile.profilePhoto}`
    : "";

  const phoneNumber = worker?.phone
    ? `${worker?.countryCode || "+91"}${worker.phone}`
    : null;

  const country = profile?.country
    ? Country.getCountryByCode(profile.country)
    : null;

  const state =
    profile?.state && profile?.country
      ? State.getStateByCodeAndCountry(profile.state, profile.country)
      : null;

  const location = [profile?.city, state?.name, country?.name]
    .filter(Boolean)
    .join(", ");

  const skills = Array.isArray(worker.skills)
    ? worker.skills
    : worker.skills?.split(",") || [];

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-4 md:p-10 relative">
      <div className="max-w-4xl mx-auto">

        {/* Back Button */}
        <div className="mb-6 flex items-center">
          <button
            onClick={goBack}
            className="group flex items-center gap-2 bg-white px-5 py-2.5 rounded-2xl border border-slate-200 text-slate-600 font-bold text-sm shadow-sm hover:border-blue-500 hover:text-blue-600 transition-all active:scale-95"
          >
            <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
            Go Back
          </button>
        </div>

        <div className="bg-white rounded-[2.5rem] shadow-xl shadow-blue-900/5 overflow-hidden border border-slate-100">

          {/* Header */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-8 md:p-12 text-white">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">

              <div className="flex items-center gap-6">

                {/* Profile Photo */}
                <div className="w-20 h-20 rounded-3xl overflow-hidden border border-white/30 bg-white/20 flex items-center justify-center">
                  {profilePhoto ? (
                    <img
                      src={profilePhoto}
                      alt={profile?.fullName}
                      className="w-full h-full object-cover"
                      onError={(e) => (e.currentTarget.style.display = "none")}
                    />
                  ) : (
                    <User size={40} className="text-white" />
                  )}
                </div>

                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h1 className="text-3xl font-bold tracking-tight">
                      {profile?.fullName || "Verified Worker"}
                    </h1>
                    <CheckCircle2 size={22} className="text-blue-300 fill-blue-500" />
                  </div>

                  <div className="flex items-center gap-2 text-blue-100 font-semibold text-sm">
                    <MapPin size={16} /> {location || "Location not specified"}
                  </div>
                </div>
              </div>

              {phoneNumber && (
                <a
                  href={`tel:${phoneNumber}`}
                  className="w-full md:w-auto bg-white text-blue-600 px-10 py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-lg hover:bg-blue-50 transition-all active:scale-95"
                >
                  <Phone size={20} /> Call Now
                </a>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="p-8 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">

            <div className="lg:col-span-2 space-y-10">

              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-6">
                  Basic Details
                </h3>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
                  <DataField label="Age" value={profile?.age} />
                  <DataField label="Gender" value={profile?.gender} />
                  <DataField label="Experience" value={skill?.experience} />
                  <DataField label="Job Type" value={skill?.jobType} />
                  <DataField label="Area" value={profile?.area} />
                  <DataField label="Preferred Area" value={skill?.preferredArea} />
                </div>
              </section>

              <section>
                <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mb-4">
                  Core Skills
                </h3>

                <div className="flex flex-wrap gap-2.5">
                  {skills.length > 0 ? (
                    skills.map((s) => (
                      <span
                        key={s}
                        className="px-5 py-2 bg-slate-50 border border-slate-200 text-slate-700 rounded-xl font-bold text-xs uppercase"
                      >
                        {s.trim()}
                      </span>
                    ))
                  ) : (
                    <p className="text-slate-400 font-bold">
                      No skills mentioned
                    </p>
                  )}
                </div>
              </section>

              {profile?.about && (
                <section className="bg-blue-50/50 p-6 rounded-3xl border border-blue-100/50">
                  <h3 className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-3">
                    Professional Summary
                  </h3>

                  <p className="text-slate-700 leading-relaxed font-bold text-sm">
                    {profile.about}
                  </p>
                </section>
              )}

            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              <div className="bg-slate-900 rounded-[2rem] p-8 text-white shadow-2xl">
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mb-2">
                  Asking Salary
                </p>



                <div className="flex items-center gap-2 text-3xl font-black text-emerald-400">
                  <IndianRupee size={28} />
                  {skill?.expectedSalary || "N/A"}
                </div>

              </div>
              <div className="bg-white rounded-[2rem] p-6 border border-slate-100 shadow-sm">
                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2">
                  Rating Summary
                </p>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200">
                    <Star size={16} className="text-yellow-500 fill-yellow-500" />
                    <span className="text-sm font-extrabold text-yellow-700">
                      {ratingSummary.avgRating || "0.0"}
                    </span>
                  </div>
                  <span className="text-xs font-bold text-slate-500">
                    {ratingSummary.totalRatings} review{ratingSummary.totalRatings === 1 ? "" : "s"}
                  </span>
                </div>
              </div>
            </div>
            <button
              onClick={() => setShowReview(true)}
              className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700 transition"
            >
              <Star size={18} /> Add Rating / Review
            </button>

          </div>
        </div>
      </div>

     {showReview && (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">

    <div className="bg-white rounded-[2rem] w-full max-w-md shadow-2xl border border-slate-100 p-8 relative animate-[fadeIn_.2s_ease]">

      {/* HEADER */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-bold text-slate-900">
          Rate this Worker
        </h2>
        <p className="text-sm text-slate-400 font-semibold mt-1">
          Share your experience
        </p>
      </div>

      {/* STARS */}
      <div className="flex justify-center gap-3 mb-8">
        {[1,2,3,4,5].map((s)=>(
          <button
            key={s}
            onClick={()=>setRating(s)}
            className="group"
          >
            <Star
              size={34}
              className={`transition-all duration-200 ${
                rating >= s
                  ? "text-yellow-400 fill-yellow-400 scale-110"
                  : "text-slate-300 group-hover:text-yellow-300"
              }`}
            />
          </button>
        ))}
      </div>

      {/* REVIEW BOX */}
      <div className="mb-8">
        <textarea
          value={review}
          onChange={(e)=>setReview(e.target.value)}
          placeholder="Write a short review..."
          rows={4}
          className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* BUTTONS */}
      <div className="flex gap-3">

        <button
          onClick={()=>setShowReview(false)}
          className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition"
        >
          Cancel
        </button>

        <button
          onClick={async () => {
            try {
              setSubmitError("");

              if (!rating) {
                setSubmitError("Please select a rating.");
                return;
              }

              setSubmitting(true);

              const res = await upsertWorkerRating(workerId,{
                rating,
                review
              });

              const summary = res?.data?.summary;

              if(summary){
                setWorker(prev =>
                  prev
                    ? {
                        ...prev,
                        avgRating: summary.avgRating,
                        totalRatings: summary.totalRatings
                      }
                    : prev
                );
              }

              setShowReview(false);
              setRating(0);
              setReview("");

            } catch (err) {
              setSubmitError(err?.message || "Failed to submit review");
            } finally {
              setSubmitting(false);
            }
          }}
          className="flex-1 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold shadow-lg hover:shadow-xl hover:scale-[1.02] transition disabled:opacity-60"
          disabled={submitting}
        >
          {submitting ? "Submitting..." : "Submit Review"}
        </button>

      </div>

      {/* ERROR */}
      {submitError && (
        <p className="mt-5 text-sm text-red-500 font-semibold text-center">
          {submitError}
        </p>
      )}

    </div>
  </div>
)}
    </div>



  );
}

function DataField({ label, value }) {
  return (
    <div>
      <p className="text-[10px] font-black text-slate-400 uppercase tracking-tighter mb-1.5">
        {label}
      </p>
      <p className="text-slate-800 font-bold text-base leading-none">
        {value || "—"}
      </p>
    </div>
  );
}
