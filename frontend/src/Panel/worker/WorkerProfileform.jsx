import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Country, State, City } from "country-state-city";
import { fetchWorkerProfile, saveWorkerProfile, updateWorkerProfile } from "../../api/workerApi";

export default function WorkerProfileform() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullName: "",
    age: "",
    gender: "",
    country: "",
    state: "",
    city: "",
    area: "",
    about: "",
    profilePhoto: null,
    existingPhotoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("create");

  useEffect(() => {
    const authToken = localStorage.getItem("workerAuthToken");
    if (!authToken) return;

    let alive = true;
    async function loadProfile() {
      try {
        const res = await fetchWorkerProfile();
        const profile = res?.data?.user?.profile || {};
        if (!alive) return;
        const rawPhoto = profile?.profilePhoto || "";
        const apiBase =
          import.meta.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_BACKEND_URL ||
          "http://localhost:5000";
        const resolvedPhoto = rawPhoto
          ? rawPhoto.startsWith("http")
            ? rawPhoto
            : `${apiBase.replace(/\/$/, "")}${rawPhoto.startsWith("/") ? "" : "/"}${rawPhoto}`
          : "";

        setForm({
          fullName: profile?.fullName || "",
          age: profile?.age ? String(profile.age) : "",
          gender: profile?.gender || "",
          country: profile?.country || "",
          state: profile?.state || "",
          city: profile?.city || "",
          area: profile?.area || "",
          about: profile?.about || "",
          profilePhoto: null,
          existingPhotoUrl: resolvedPhoto,
        });
        setMode("edit");
      } catch (err) {
        const message = err?.message || "";
        if (authToken && /token|session|authorization|unauthorized|expired|forbidden/i.test(message)) {
          localStorage.removeItem("workerAuthToken");
        }
        setMode("edit");
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, []);

  const countries = Country.getAllCountries();
  const states = form.country ? State.getStatesOfCountry(form.country) : [];
  const cities = form.state ? City.getCitiesOfState(form.country, form.state) : [];

  const handleNext = async () => {
    if (!form.fullName || !form.age || !form.gender) {
      alert("Please fill required fields (Name, Age, Gender)");
      return;
    }

    const authToken = localStorage.getItem("workerAuthToken");
    const onboardingToken = localStorage.getItem("workerOnboardingToken");
    if (!authToken && !onboardingToken) {
      navigate("/worker-signup");
      return;
    }

    try {
      setLoading(true);
      const hasPhoto = Boolean(form.profilePhoto);
      const payload = hasPhoto ? new FormData() : {};

      if (hasPhoto) {
        payload.append("fullName", form.fullName);
        payload.append("age", form.age);
        payload.append("gender", form.gender);
        if (form.country) payload.append("country", form.country);
        if (form.state) payload.append("state", form.state);
        if (form.city) payload.append("city", form.city);
        if (form.area) payload.append("area", form.area);
        if (form.about) payload.append("about", form.about);
        payload.append("profilePhoto", form.profilePhoto);
      } else {
        payload.fullName = form.fullName;
        payload.age = form.age;
        payload.gender = form.gender;
        payload.country = form.country;
        payload.state = form.state;
        payload.city = form.city;
        payload.area = form.area;
        payload.about = form.about;
      }

      const res = authToken ? await updateWorkerProfile(payload) : await saveWorkerProfile(payload);
      const route = authToken ? "/worker/profile" : res?.data?.next?.route || "/worker-skills";
      navigate(route);
    } catch (err) {
      const message = err?.message || "Failed to save profile";
      if (authToken && /token|session|authorization|unauthorized|expired|forbidden/i.test(message)) {
        localStorage.removeItem("workerAuthToken");
        alert("Session expired. Please login again.");
        navigate("/worker-signup");
        return;
      }
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/")}
          className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400"
        >
          ←
        </button>
        <div className="text-center">
          <h1 className="font-black text-[15px] uppercase tracking-tight">Basic Profile</h1>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 1 of 4</p>
          </div>
        </div>
        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-lg">👤</div>
      </div>

      <div className="max-w-md mx-auto w-full px-6 py-8 space-y-6 pb-32">
        <div className="flex flex-col items-center group">
          <div className="relative">
            <div className="w-24 h-24 bg-gradient-to-tr from-emerald-500 to-teal-400 rounded-[2.5rem] flex items-center justify-center text-white text-3xl shadow-xl shadow-emerald-100 border-4 border-white overflow-hidden">
              {form.profilePhoto ? (
                <img
                  src={URL.createObjectURL(form.profilePhoto)}
                  alt="Profile preview"
                  className="w-full h-full object-cover"
                />
              ) : form.existingPhotoUrl ? (
                <img
                  src={form.existingPhotoUrl}
                  alt="Profile"
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="text-2xl">W</span>
              )}
            </div>
            <label className="absolute -bottom-2 -right-2 bg-slate-900 text-white w-8 h-8 rounded-full flex items-center justify-center border-4 border-white cursor-pointer active:scale-90 transition-all">
              +
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) =>
                  setForm({
                    ...form,
                    profilePhoto: e.target.files?.[0] || null,
                  })
                }
              />
            </label>
          </div>
          <p className="text-[10px] font-black uppercase text-emerald-600 mt-4 tracking-widest">Upload Photo</p>
        </div>

        <div className="space-y-4 pt-4">
          <div className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">
              Full Name *
            </label>
            <input
              type="text"
              placeholder="enter your name "
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
              value={form.fullName}
              onChange={(e) => setForm({ ...form, fullName: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">
                Age *
              </label>
              <input
                type="tel"
                maxLength={2}
                placeholder="enter your age"
                className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all"
                value={form.age}
                onChange={(e) => setForm({ ...form, age: e.target.value.replace(/\D/g, "") })}
              />
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">
                Gender *
              </label>
              <div className="flex bg-slate-100 rounded-2xl p-1 gap-1 h-[48px]">
                {["Male", "Female"].map((g) => (
                  <button
                    key={g}
                    onClick={() => setForm({ ...form, gender: g })}
                    className={`flex-1 rounded-xl text-[10px] font-black uppercase transition-all ${
                      form.gender === g ? "bg-white text-slate-900 shadow-sm" : "text-slate-400"
                    }`}
                  >
                    {g}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 bg-white p-5 rounded-[2.5rem] border-2 border-slate-100 shadow-sm shadow-slate-100">
            <h3 className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] mb-1">Work Location</h3>

            <select
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(e) => setForm({ ...form, country: e.target.value })}
              value={form.country}
            >
              <option value="">Select Country</option>
              {countries.map((c) => (
                <option key={c.isoCode} value={c.isoCode}>
                  {c.name}
                </option>
              ))}
            </select>

            <select
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(e) => setForm({ ...form, state: e.target.value })}
              value={form.state}
              disabled={!form.country}
            >
              <option value="">Select State</option>
              {states.map((s) => (
                <option key={s.isoCode} value={s.isoCode}>
                  {s.name}
                </option>
              ))}
            </select>

            <select
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              onChange={(e) => setForm({ ...form, city: e.target.value })}
              value={form.city}
              disabled={!form.state}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </select>

            <input
              placeholder="Area / Locality (e.g. Vaishali Nagar)"
              className="w-full bg-slate-50 border-none rounded-xl px-4 py-3 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-emerald-500/20"
              value={form.area}
              onChange={(e) => setForm({ ...form, area: e.target.value })}
            />
          </div>

          <div>
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-1.5 ml-1 tracking-widest">
              About / Experience Bio
            </label>
            <textarea
              placeholder="Tell us about your work history..."
              rows="3"
              className="w-full bg-white border-2 border-slate-100 rounded-2xl px-4 py-3.5 text-sm font-bold text-slate-900 outline-none focus:border-emerald-500 transition-all resize-none"
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
            />
          </div>
        </div>

        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
          <div className="max-w-md mx-auto">
            <button
              onClick={handleNext}
              disabled={loading}
              className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-slate-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {loading ? "Saving..." : "Continue to Skills"} <span className="text-lg">→</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
