import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { uploadWorkerDocuments } from "../../api/workerApi";

export default function UploadDocuments() {
  const navigate = useNavigate();

  const [docs, setDocs] = useState({
    aadhaar: null,
    police: null,
    experience: null,
  });

  const [previews, setPreviews] = useState({
    aadhaar: null,
    police: null,
    experience: null,
  });

  const [loading, setLoading] = useState(false);

  const handleFile = (e, name) => {
    const file = e.target.files[0];
    if (file) {
      setDocs({ ...docs, [name]: file });
      setPreviews({ ...previews, [name]: URL.createObjectURL(file) });
    }
    e.target.value = null;
  };

  const cancelFile = (name) => {
    setDocs({ ...docs, [name]: null });
    setPreviews({ ...previews, [name]: null });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("workerOnboardingToken");
    if (!token) {
      navigate("/worker-signup");
      return;
    }

    const formData = new FormData();
    if (docs.aadhaar) formData.append("idProof", docs.aadhaar);
    if (docs.police) formData.append("addressProof", docs.police);
    if (docs.experience) formData.append("certificate", docs.experience);

    try {
      setLoading(true);
      const res = await uploadWorkerDocuments(formData);
      const route = res?.data?.next?.route || "/worker-dashboard";
      navigate(route);
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans pb-24">
      <div className="sticky top-0 z-50 bg-white border-b px-4 py-5 flex items-center justify-between">
        <button
          onClick={() => navigate("/worker-skills")}
          className="w-10 h-10 border border-slate-200 rounded-xl flex items-center justify-center text-slate-400 active:scale-90 transition-all"
        >
          ←
        </button>

        <div className="text-center">
          <h1 className="font-black text-[15px] uppercase tracking-tight text-slate-900">Verification</h1>
          <div className="flex items-center justify-center gap-1.5 mt-0.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Step 3 of 4</p>
          </div>
        </div>

        <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center text-lg shadow-sm">🛡️</div>
      </div>

      <div className="max-w-md mx-auto w-full px-6 py-8 space-y-6 flex-1">
        {[
          { id: "aadhaar", label: "Aadhaar Card", sub: "Official ID Proof" },
          { id: "police", label: "Police Verification", sub: "Security Clearance" },
          { id: "experience", label: "Experience Proof", sub: "Optional Documents" },
        ].map((item) => (
          <div key={item.id} className="relative">
            <label className="block text-[10px] font-black text-slate-400 uppercase mb-2 ml-1 tracking-[0.15em]">
              {item.label}
            </label>

            <div
              className={`relative border-2 border-dashed rounded-[2rem] p-4 transition-all h-36 flex flex-col items-center justify-center
              ${docs[item.id] ? "border-emerald-500 bg-emerald-50/30" : "border-slate-200 bg-white shadow-sm"}`}
            >
              {!docs[item.id] ? (
                <label className="cursor-pointer flex flex-col items-center group w-full h-full justify-center">
                  <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white transition-all shadow-inner">
                    +
                  </div>
                  <span className="text-[10px] font-black text-slate-400 uppercase mt-2 group-hover:text-emerald-500 tracking-tighter">
                    Upload {item.sub}
                  </span>
                  <input
                    type="file"
                    className="hidden"
                    accept="image/*,application/pdf"
                    onChange={(e) => handleFile(e, item.id)}
                  />
                </label>
              ) : (
                <div className="w-full h-full flex items-center gap-4">
                  <div className="w-20 h-20 bg-white rounded-2xl overflow-hidden border-2 border-emerald-100 shadow-md">
                    {docs[item.id].type.startsWith("image") ? (
                      <img src={previews[item.id]} alt="preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-3xl">📄</div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className="text-[11px] font-black text-slate-700 truncate tracking-tight">
                      {docs[item.id].name}
                    </p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase mt-0.5 tracking-widest italic underline">
                      File Attached
                    </p>
                    <button
                      onClick={() => cancelFile(item.id)}
                      className="mt-3 text-[10px] font-black text-red-500 uppercase flex items-center gap-1.5 active:scale-90 transition-all bg-red-50 px-2.5 py-1 rounded-lg"
                    >
                      <span className="text-lg leading-none">×</span> Remove
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}

        <div className="bg-white border-2 border-slate-100 rounded-[2rem] p-5 shadow-sm">
          <p className="text-[10px] font-bold text-slate-400 leading-relaxed uppercase tracking-widest text-center">
            Your data is encrypted & secure
          </p>
        </div>
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur-xl border-t border-slate-100 z-50">
        <div className="max-w-md mx-auto">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full py-4.5 bg-slate-900 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-2xl active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {loading ? "Uploading..." : "Finish & Go to Dashboard"} <span className="text-lg">✅</span>
          </button>
        </div>
      </div>
    </div>
  );
}

