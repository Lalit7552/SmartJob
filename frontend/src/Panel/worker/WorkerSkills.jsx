import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchWorkerProfile, saveWorkerSkills, updateWorkerSkills } from "../../api/workerApi";

const INITIAL_SKILLS = [
  "Electrician",
  "Plumber",
  "Driver",
  "Cook",
  "Guard",
  "Maid",
  "Carpenter",
  "Painter",
  "Sweeper",
  "Gardener",
];

export default function WorkerSkills() {
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [customSkill, setCustomSkill] = useState("");
  const [experience, setExperience] = useState("");
  const [jobType, setJobType] = useState("");
  const [salary, setSalary] = useState("");
  const [area, setArea] = useState("");
  const [allSkills, setAllSkills] = useState(INITIAL_SKILLS);
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("create");

  useEffect(() => {
    const authToken = localStorage.getItem("workerAuthToken");
    if (!authToken) return;

    let alive = true;
    async function loadSkills() {
      try {
        const res = await fetchWorkerProfile();
        const user = res?.data?.user || res?.data || {};
        const skills = Array.isArray(user?.skills) ? user.skills : [];
        const detail = user?.skillDetails || {};
        if (!alive) return;
        if (skills.length) {
          setSelected(skills);
          setAllSkills((prev) => Array.from(new Set([...skills, ...prev])));
        }
        setExperience(detail?.experience || "");
        setJobType(detail?.jobType || "");
        setSalary(detail?.expectedSalary ? String(detail.expectedSalary) : "");
        setArea(detail?.preferredArea || "");
        setMode("edit");
      } catch {
        setMode("edit");
      }
    }

    loadSkills();
    return () => {
      alive = false;
    };
  }, []);

  const toggleSkill = (skill) => {
    if (selected.includes(skill)) setSelected(selected.filter((s) => s !== skill));
    else setSelected([...selected, skill]);
  };

  const handleAddCustomSkill = () => {
    const trimmed = customSkill.trim();
    if (trimmed && !allSkills.includes(trimmed)) {
      setAllSkills([trimmed, ...allSkills]);
      setSelected([...selected, trimmed]);
      setCustomSkill("");
    }
  };

  const filteredSkills = allSkills.filter((s) => s.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleContinue = async () => {
    const authToken = localStorage.getItem("workerAuthToken");
    const onboardingToken = localStorage.getItem("workerOnboardingToken");
    if (!authToken && !onboardingToken) {
      navigate("/worker-signup");
      return;
    }
    if (selected.length === 0) {
      alert("Please select at least 1 skill");
      return;
    }

    try {
      setLoading(true);
      const res = authToken
        ? await updateWorkerSkills({
            skills: selected,
            experience,
            jobType,
            salary,
            preferredArea: area,
          })
        : await saveWorkerSkills({
            skills: selected,
            experience,
            jobType,
            salary,
            preferredArea: area,
          });
      const route = authToken ? "/worker/profile" : res?.data?.next?.route || "/worker-document";
      navigate(route);
    } catch (err) {
      alert(err.message || "Failed to save skills");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="bg-white border-b px-6 py-5 sticky top-0 z-50">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-xl font-black uppercase tracking-tight text-slate-900">
            Skills <span className="text-emerald-500 italic">&</span> Expertise
          </h1>
          <span className="bg-emerald-50 text-emerald-600 text-[10px] font-black px-3 py-1 rounded-full border border-emerald-100 uppercase">
            {selected.length} Selected
          </span>

          <button
            onClick={() => navigate("/worker-profile")}
            className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all"
          >
            ←
          </button>
        </div>

        <div className="relative">
          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400">🔍</span>
          <input
            type="text"
            placeholder="Search skills (e.g. Cook, Driver)"
            className="w-full bg-slate-100 border-none rounded-2xl pl-10 pr-4 py-3 text-sm font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20 transition-all"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="flex-1 p-6 pb-32">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {filteredSkills.map((skill) => {
            const isSelected = selected.includes(skill);
            return (
              <button
                key={skill}
                onClick={() => toggleSkill(skill)}
                className={`p-4 rounded-[1.5rem] border-2 text-left transition-all duration-200 active:scale-95 flex flex-col justify-between h-24
                ${
                  isSelected
                    ? "bg-emerald-500 border-emerald-500 text-white shadow-lg shadow-emerald-100"
                    : "bg-white border-white text-slate-600 shadow-sm shadow-slate-200/50"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] border ${
                    isSelected ? "bg-white/20 border-white/40" : "bg-slate-50 border-slate-100"
                  }`}
                >
                  {isSelected ? "✓" : "+"}
                </div>
                <span className="text-[11px] font-black uppercase tracking-tight leading-tight">{skill}</span>
              </button>
            );
          })}
        </div>

        <div className="mt-10 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm space-y-4">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-2 ml-1">Job Details</h3>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Experience</label>
            <select
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
              value={experience}
              onChange={(e) => setExperience(e.target.value)}
            >
              <option value="">Select Experience</option>
              <option>Fresher</option>
              <option>1 Year</option>
              <option>2 Years</option>
              <option>3+ Years</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Job Preference</label>
            <select
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
              value={jobType}
              onChange={(e) => setJobType(e.target.value)}
            >
              <option value="">Select Type</option>
              <option>Full Time</option>
              <option>Part Time</option>
              <option>Both</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Expected Salary</label>
            <input
              type="number"
              placeholder="₹ Expected Salary"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
              value={salary}
              onChange={(e) => setSalary(e.target.value)}
            />
          </div>

          <div>
            <label className="text-xs font-bold text-slate-600 block mb-1">Preferred Area</label>
            <input
              type="text"
              placeholder="Enter area"
              className="w-full bg-slate-50 rounded-xl px-4 py-3 text-xs font-bold outline-none"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
        </div>

        <div className="mt-10 bg-white p-6 rounded-[2.5rem] border-2 border-slate-100 shadow-sm">
          <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-4 ml-1">
            Skill not in list? Add here
          </h3>
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Type your skill..."
              className="flex-1 bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={customSkill}
              onChange={(e) => setCustomSkill(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAddCustomSkill()}
            />
            <button
              onClick={handleAddCustomSkill}
              className="bg-slate-900 text-white px-5 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest active:scale-90 transition-all"
            >
              Add
            </button>
          </div>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
        <div className="max-w-md mx-auto">
          <button
            className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            onClick={handleContinue}
            disabled={loading}
          >
            {loading ? "Saving..." : mode === "edit" ? "Save Skills" : "Continue"} <span className="text-lg">→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
