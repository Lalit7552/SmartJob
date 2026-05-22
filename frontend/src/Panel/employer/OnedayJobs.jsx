import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Calendar, Clock, MapPin, Wallet, LocateFixed } from "lucide-react";
import { State } from "country-state-city";
import { fetchEmployerEnquiries, fetchEmployerJobs, generateEnquiryOtp } from "../../api/employerApi";
import LiveJobMap from "../../component/LiveJobMap";

export default function OnedayJobs() {
  const [jobs, setJobs] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [loadingJobs, setLoadingJobs] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingId, setGeneratingId] = useState("");
  const [otpByEnquiry, setOtpByEnquiry] = useState({});
  const [trackingOpenByEnquiry, setTrackingOpenByEnquiry] = useState({});

  const loadJobs = useCallback(async ({ silent = false } = {}) => {
    try {
      if (silent) {
        setRefreshing(true);
      } else {
        setLoadingJobs(true);
      }
      const [jobsRes, enquiriesRes] = await Promise.all([
        fetchEmployerJobs(),
        fetchEmployerEnquiries(),
      ]);
      setJobs(jobsRes?.data?.jobs || []);
      setEnquiries(enquiriesRes?.data?.enquiries || []);
    } catch (err) {
      console.error("Employer One Day Jobs Load Error", err);
      setJobs([]);
      setEnquiries([]);
    } finally {
      if (silent) {
        setRefreshing(false);
      } else {
        setLoadingJobs(false);
      }
    }
  }, []);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    const handleFocus = () => loadJobs({ silent: true });
    const handleVisibility = () => {
      if (!document.hidden) loadJobs({ silent: true });
    };
    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [loadJobs]);

  const oneDayJobs = useMemo(
    () => jobs.filter((job) => job.type === "One Day Job"),
    [jobs]
  );

  const enquiriesByJob = useMemo(() => {
    const grouped = new Map();
    enquiries.forEach((enquiry) => {
      const jobIdRaw = enquiry?.job?._id || enquiry?.job?.id;
      const jobId = jobIdRaw ? String(jobIdRaw) : "";
      if (!jobId) return;
      if (!grouped.has(jobId)) grouped.set(jobId, []);
      grouped.get(jobId).push(enquiry);
    });
    return grouped;
  }, [enquiries]);

  const handleGenerateOtp = async (enquiryId) => {
    if (!enquiryId || generatingId) return;
    try {
      setGeneratingId(String(enquiryId));
      const res = await generateEnquiryOtp(enquiryId);
      const otp = res?.data?.otp;
      const workStatus = res?.data?.workStatus || "otp_generated";
      setOtpByEnquiry((prev) => ({ ...prev, [enquiryId]: otp }));
      setEnquiries((prev) =>
        prev.map((enquiry) =>
          (enquiry.id || enquiry._id) === enquiryId
            ? {
                ...enquiry,
                workStatus,
                otpGeneratedAt: new Date().toISOString(),
                otpExpiresAt: res?.data?.expiresAt || enquiry.otpExpiresAt,
              }
            : enquiry
        )
      );
    } catch (err) {
      console.error("OTP generate failed", err);
    } finally {
      setGeneratingId("");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <div className="bg-white border-b border-slate-200 px-6 pt-12 pb-6">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <h1 className="text-3xl font-black tracking-tight">One Day Jobs</h1>
            <button
              onClick={() => loadJobs({ silent: true })}
              disabled={refreshing}
              className={`h-10 px-4 rounded-xl text-[11px] font-black uppercase tracking-widest border transition-all ${
                refreshing
                  ? "bg-slate-200 text-slate-400 border-slate-200 cursor-wait"
                  : "bg-white text-slate-700 border-slate-300 hover:border-slate-400"
              }`}
            >
              {refreshing ? "Refreshing..." : "Refresh"}
            </button>
          </div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-2">
            {oneDayJobs.length} Posted
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-10 pb-24 space-y-5">
        {loadingJobs ? (
          <div className="text-center py-20 text-slate-400 font-bold uppercase tracking-widest animate-pulse">
            Loading jobs...
          </div>
        ) : oneDayJobs.length === 0 ? (
          <div className="bg-white p-16 rounded-[2rem] border border-slate-200 text-slate-400 text-center shadow-sm">
            No one day jobs posted yet.
          </div>
        ) : (
          oneDayJobs.map((job) => {
            const location = buildLocation(job);
            const jobId = String(job._id || job.id || "");
            const jobEnquiries = enquiriesByJob.get(jobId) || [];
            return (
              <div
                key={jobId}
                className="bg-white border border-slate-200 rounded-[2rem] p-6 md:p-8 flex flex-col gap-4 shadow-sm"
              >
                <div>
                  <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase">
                    {job.title || "Untitled Job"}
                  </h3>
                  <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">
                    {job.category || "General"}
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-[11px] font-bold uppercase text-slate-500 tracking-widest">
                  {job.date && (
                    <span className="flex items-center gap-2">
                      <Calendar size={14} className="text-blue-500" />
                      {job.date}
                    </span>
                  )}
                  {(job.startTime || job.endTime) && (
                    <span className="flex items-center gap-2">
                      <Clock size={14} className="text-emerald-500" />
                      {[job.startTime, job.endTime].filter(Boolean).join(" - ")}
                    </span>
                  )}
                  {job.payment && (
                    <span className="flex items-center gap-2">
                      <Wallet size={14} className="text-amber-500" />
                      {job.payment}
                    </span>
                  )}
                  {location && (
                    <span className="flex items-center gap-2">
                      <MapPin size={14} className="text-rose-500" />
                      {location}
                    </span>
                  )}
                </div>

                {job.address && (
                  <p className="text-xs text-slate-500 italic">{job.address}</p>
                )}

                <div className="border-t border-slate-100 pt-4">
                  <p className="text-[11px] font-black uppercase tracking-widest text-slate-400 mb-3">
                    Applied Workers
                  </p>

                  {jobEnquiries.length === 0 ? (
                    <p className="text-xs text-slate-400">No applications yet.</p>
                  ) : (
                    <div className="space-y-3">
                      {jobEnquiries.map((enquiry) => {
                        const enquiryId = enquiry?.id || enquiry?._id;
                        const worker = enquiry?.worker || {};
                        const profile = worker?.profile || {};
                        const name = profile?.fullName || worker?.phone || "Worker";
                        const workStatus = enquiry?.workStatus || "applied";
                        const otpValue = otpByEnquiry[enquiryId];
                        return (
                          <div key={enquiryId || `${jobId}-${name}`} className="space-y-3">
                            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 bg-slate-50 rounded-2xl border border-slate-100 px-4 py-3">
                              <div>
                                <p className="text-sm font-black text-slate-900 uppercase tracking-tight">
                                  {name}
                                </p>
                                <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500">
                                  Status: {workStatus.replace("_", " ")}
                                </p>
                                {otpValue && (
                                  <p className="text-xs font-black text-emerald-600 mt-1">
                                    OTP: {otpValue}
                                  </p>
                                )}
                              </div>

                              <div className="flex flex-wrap items-center gap-2">
                                {workStatus === "done" ? (
                                  <div className="px-4 py-2 rounded-xl bg-emerald-600 text-white text-[10px] font-black uppercase tracking-[0.1em]">
                                    Task Accomplished
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleGenerateOtp(enquiryId)}
                                    disabled={generatingId === String(enquiryId)}
                                    className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] shadow-lg shadow-blue-500/20 transition-all ${
                                      generatingId === String(enquiryId)
                                        ? "bg-slate-400 text-white cursor-wait"
                                        : "bg-blue-600 hover:bg-blue-700 text-white"
                                    }`}
                                  >
                                    {workStatus === "otp_generated" || otpValue ? "Regenerate OTP" : "Generate OTP"}
                                  </button>
                                )}
                                {workStatus === "in_progress" && jobId && (
                                  <button
                                    onClick={() =>
                                      setTrackingOpenByEnquiry((prev) => ({
                                        ...prev,
                                        [enquiryId]: !prev[enquiryId],
                                      }))
                                    }
                                    className="px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-[0.1em] bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-300/40 transition-all"
                                  >
                                    <span className="inline-flex items-center gap-2">
                                      <LocateFixed size={12} />
                                      {trackingOpenByEnquiry[enquiryId] ? "Hide Live Map" : "Live Track"}
                                    </span>
                                  </button>
                                )}
                              </div>
                            </div>

                            {workStatus === "in_progress" && trackingOpenByEnquiry[enquiryId] && jobId && (
                              <div className="bg-white rounded-2xl border border-slate-100 p-3">
                                <LiveJobMap jobId={jobId} role="employer" active height={220} />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  )}
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
  if (!job.city && !job.state) return "";
  const stateName = job.state
    ? State.getStateByCodeAndCountry(job.state, job.country || "IN")?.name
    : "";
  return [job.city, stateName].filter(Boolean).join(", ");
}
