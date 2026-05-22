import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { 
  User, 
  MapPin, 
  Calendar, 
  ArrowRight,
  Search,
  CheckCircle2,
  Star
} from "lucide-react";
import { fetchApprovedWorkers } from "../../api/employerApi";

export default function EmployeeJobs() {
  const [workers, setWorkers] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const baseURL = "http://localhost:5000";

  useEffect(() => {
    const loadWorkers = async () => {
      try {
        setLoading(true);
        const res = await fetchApprovedWorkers();
        setWorkers(res?.data?.workers || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadWorkers();
  }, []);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-900 p-6 md:p-12 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-10 gap-6">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Available <span className="text-blue-600">Talent</span>
            </h1>
            <p className="text-slate-500 text-sm mt-1 font-medium">
              Connect with verified professionals for your project.
            </p>
          </div>
          
          <div className="relative group">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-600 transition-colors"
              size={18}
            />
            <input
              type="text"
              placeholder="Search by name or skill..."
              className="bg-white border border-slate-200 rounded-2xl py-3 pl-12 pr-6 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-50 transition-all w-full md:w-72 text-sm shadow-sm"
            />
          </div>
        </div>

        {/* WORKER LIST */}
        <div className="grid gap-5">
          {loading ? (
            [1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-32 bg-white animate-pulse rounded-[2rem] border border-slate-100 shadow-sm"
              />
            ))
          ) : workers.length > 0 ? (
            workers.map((worker) => {
              const profile = worker?.profile || {};
              const skills = Array.isArray(worker.skills)
                ? worker.skills
                : worker.skills?.split(",") || [];

              const profilePhoto = profile?.profilePhoto
                ? `${baseURL}${profile.profilePhoto}`
                : "";

              return (
                <div
                  key={worker.id}
                  onClick={() =>
                    navigate(`/employee/workerdetail?workerId=${worker.id}`)
                  }
                  className="group relative bg-white border border-slate-100 rounded-[2rem] p-6 cursor-pointer hover:border-blue-400 hover:shadow-xl hover:shadow-blue-900/5 transition-all duration-300"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-5">

                      {/* PROFILE PHOTO */}
                      <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-50 border border-slate-100 flex items-center justify-center">
                        {profilePhoto ? (
                          <img
                            src={profilePhoto}
                            alt={profile?.fullName}
                            className="w-full h-full object-cover"
                            onError={(e) =>
                              (e.currentTarget.style.display = "none")
                            }
                          />
                        ) : (
                          <User size={28} className="text-slate-400" />
                        )}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="text-xl font-bold tracking-tight text-slate-800 group-hover:text-blue-600 transition-colors">
                            {profile?.fullName || "Verified Worker"}
                          </h3>
                          <CheckCircle2
                            size={16}
                            className="text-blue-500 fill-blue-50"
                          />
                          <div className="flex items-center gap-1 bg-yellow-50 px-2 py-0.5 rounded-lg border border-yellow-200">
                            <Star size={12} className="text-yellow-500 fill-yellow-500" />
                            <span className="text-[10px] font-bold text-yellow-700">
                              {worker?.avgRating || "0.0"} · {worker?.totalRatings || 0} reviews
                            </span>
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-y-1 gap-x-4 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Calendar size={14} className="text-slate-400" />
                            Age: {profile?.age || "N/A"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <MapPin size={14} className="text-slate-400" />
                            {profile?.city || "Location N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4">
                      <div className="p-3 rounded-full bg-slate-50 text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all transform group-hover:translate-x-1">
                        <ArrowRight size={20} />
                      </div>
                    </div>
                  </div>

                  {/* SKILLS */}
                  {skills.length > 0 && (
                    <div className="mt-5 flex flex-wrap gap-2">
                      {skills.slice(0, 4).map((skill, i) => (
                        <span
                          key={i}
                          className="text-[10px] bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-xl text-blue-700 font-bold uppercase"
                        >
                          {skill.trim()}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="text-center py-20 bg-white rounded-[2rem] border-2 border-dashed border-slate-200">
              <p className="text-slate-400 font-medium">
                No workers are currently listed.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
