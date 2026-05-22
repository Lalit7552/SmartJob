import React, { useEffect, useState } from "react";
import { Plus, Star, Clock, CheckCircle2, Trash2, MapPin, Briefcase } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { State } from "country-state-city";
import { deleteEmployerJob, fetchEmployerJobs } from "../../api/employerApi";

export default function PremiumMyJobs() {
  const navigate = useNavigate();
  const [jobs, setJobs] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [deletingJobId, setDeletingJobId] = useState(null);

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoadingJobs(true);
        const res = await fetchEmployerJobs();
        setJobs(res?.data?.jobs || []);
      } catch (err) {
        console.error(err);
        setJobs([]);
      } finally {
        setLoadingJobs(false);
      }
    };
    loadJobs();
  }, []);

  const handleDeleteJob = async (job) => {
    const jobId = job?._id || job?.id;
    if (!jobId || deletingJobId) return;

    if (!window.confirm("Delete this job?")) return;

    setDeletingJobId(jobId);
    const prev = jobs;
    setJobs((j) => j.filter((x) => (x._id || x.id) !== jobId));

    try {
      await deleteEmployerJob(jobId);
    } catch {
      setJobs(prev);
    } finally {
      setDeletingJobId(null);
    }
  };

  const filteredJobs = jobs.filter((j) => j.type !== "One Day Job");
  const totalJobs = filteredJobs.length;
  const activeJobs = filteredJobs.filter((j) => j.status === "Active").length;

  return (
    <div
      className="min-h-screen pb-16"
      style={{ background: "#ffffff", fontFamily: "'Sora', sans-serif", color: "#0f172a" }}
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sora:wght@400;500;600;700;800&display=swap');

        .job-card {
          border: 1px solid #e2e8f0;
          transition: all .2s;
        }
        .job-card:hover {
          border-color: #c7d2fe;
          box-shadow: 0 6px 24px rgba(0,0,0,0.08);
          transform: translateY(-2px);
        }
      `}</style>

      {/* HEADER */}
      <div
        className="sticky top-0 z-10 px-5 pt-6 pb-4"
        style={{
          background: "rgba(255,255,255,0.95)",
          backdropFilter: "blur(20px)",
          borderBottom: "1px solid #e2e8f0",
        }}
      >
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-slate-800">My Jobs</h1>
            <p className="text-xs text-slate-500">
              {totalJobs} Total · <span className="text-blue-600">{activeJobs} Active</span>
            </p>
          </div>

          <button
            onClick={() => navigate("/employer/post-job")}
            className="w-10 h-10 flex items-center justify-center rounded-xl bg-blue-600 text-white"
          >
            <Plus size={18} />
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-3">

        {loadingJobs ? (
          <p className="text-center text-slate-500">Loading...</p>
        ) : filteredJobs.length === 0 ? (
          <div className="p-10 text-center border border-dashed border-slate-200 bg-slate-50 rounded-2xl">
            <Briefcase className="mx-auto mb-3 text-blue-500" />
            <p className="font-semibold text-slate-600">No jobs posted</p>
          </div>
        ) : (
          filteredJobs.map((job) => {
            const id = job._id || job.id;
            const location = buildLocation(job);
            const deleting = deletingJobId === id;

            return (
              <div
                key={id}
                className="job-card rounded-2xl p-5 cursor-pointer"
                onClick={() => navigate(`/employee/myjobs/${id}`)}
              >
                {/* TOP */}
                <div className="flex justify-between mb-3">
                  <div>
                    <h3 className="font-semibold text-slate-800">{job.title}</h3>
                    <div className="flex items-center gap-1 text-xs text-slate-500 mt-1">
                      <Clock size={12} /> {job.category}
                    </div>
                  </div>
                  <StatusBadge status={job.status} />
                </div>

                {/* LOCATION */}
                {location && (
                  <div className="flex items-center text-xs text-slate-500 mb-3">
                    <MapPin size={12} className="mr-1" />
                    {location}
                  </div>
                )}

                {/* ACTIONS */}
                <div className="flex gap-2">
                  {job.status !== "Active" && (
                    <button
                      onClick={(e) => e.stopPropagation()}
                      className="px-3 py-1 text-xs bg-yellow-100 text-yellow-700 rounded-lg"
                    >
                      <Star size={12} className="inline mr-1" />
                      Rate
                    </button>
                  )}

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteJob(job);
                    }}
                    disabled={deleting}
                    className="px-3 py-1 text-xs rounded-lg border border-slate-200 text-slate-600 hover:bg-red-100 hover:text-red-600"
                  >
                    <Trash2 size={12} className="inline mr-1" />
                    {deleting ? "Deleting..." : "Delete"}
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

function buildLocation(job) {
  if (!job) return "";
  const state = job.state
    ? State.getStateByCodeAndCountry(job.state, job.country || "IN")?.name
    : "";
  return [job.city, state].filter(Boolean).join(", ");
}

function StatusBadge({ status }) {
  const map = {
    Active: "bg-blue-100 text-blue-600",
    Completed: "bg-green-100 text-green-600",
    Cancelled: "bg-slate-100 text-slate-500",
  };

  return (
    <span className={`text-xs px-2 py-1 rounded-full ${map[status] || map.Active}`}>
      {status}
    </span>
  );
}
