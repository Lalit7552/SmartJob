import React, { useEffect, useState } from "react";
import { Star, User } from "lucide-react";
import { fetchWorkerRatings } from "../../api/workerApi";

export default function Rating() {
  const [ratings, setRatings] = useState([]);
  const [summary, setSummary] = useState({ avgRating: 0, totalRatings: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadRatings = async () => {
      try {
        setLoading(true);
        setError("");
        const res = await fetchWorkerRatings();
        setRatings(res?.data?.ratings || []);
        setSummary(res?.data?.summary || { avgRating: 0, totalRatings: 0 });
      } catch (err) {
        setError(err?.message || "Failed to load ratings");
      } finally {
        setLoading(false);
      }
    };
    loadRatings();
  }, []);

  const baseURL = "http://localhost:5000";

  return (
    <div className="min-h-screen bg-[#F8FAFC] p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-slate-100 mb-6">
          <h1 className="text-xl font-black text-slate-800">Ratings & Reviews</h1>
          <p className="text-xs text-slate-400 mt-1">
            What employers are saying about you
          </p>

          <div className="mt-5 flex items-center gap-3">
            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-xl border border-yellow-200">
              <Star size={16} className="text-yellow-500 fill-yellow-500" />
              <span className="text-sm font-extrabold text-yellow-700">
                {summary.avgRating || "0.0"}
              </span>
            </div>
            <span className="text-xs font-bold text-slate-500">
              {summary.totalRatings} review{summary.totalRatings === 1 ? "" : "s"}
            </span>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-10 text-slate-400 animate-pulse">
            Loading ratings...
          </div>
        ) : error ? (
          <div className="bg-white p-10 rounded-3xl text-center border-2 border-dashed border-slate-200 text-slate-400">
            <p className="font-bold text-slate-500">Unable to load ratings.</p>
            <p className="text-xs mt-2">{error}</p>
          </div>
        ) : ratings.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl text-center border-2 border-dashed border-slate-200 text-slate-400">
            <p className="font-bold text-slate-500">No ratings yet.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {ratings.map((r) => {
              const photo = r.employer?.profilePhoto
                ? `${baseURL}${r.employer.profilePhoto}`
                : "";
              return (
                <div
                  key={r.id}
                  className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl overflow-hidden border border-slate-100 bg-slate-50 flex items-center justify-center">
                        {photo ? (
                          <img
                            src={photo}
                            alt={r.employer?.name}
                            className="w-full h-full object-cover"
                            onError={(e) => (e.currentTarget.style.display = "none")}
                          />
                        ) : (
                          <User size={20} className="text-slate-400" />
                        )}
                      </div>

                      <div>
                        <p className="font-bold text-slate-800">
                          {r.employer?.name || "Employer"}
                        </p>
                        {r.employer?.companyName && (
                          <p className="text-xs text-slate-400">
                            {r.employer.companyName}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-lg border border-yellow-200">
                      <Star size={12} className="text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-yellow-600">
                        {r.rating}
                      </span>
                    </div>
                  </div>

                  {r.review && (
                    <p className="mt-4 text-sm text-slate-700 font-semibold leading-relaxed">
                      {r.review}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
