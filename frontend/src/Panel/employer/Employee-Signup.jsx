import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { requestEmployerOtp, verifyEmployerOtp } from "../../api/employerApi";

export default function EmployeeSignup() {
  const navigate = useNavigate();
  const [step, setStep] = useState("phone");
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState(["", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleSendOtp = async () => {
    if (phone.length !== 10) return;
    try {
      setMessage("");
      setLoading(true);
      await requestEmployerOtp({ phone, countryCode: "+91" });
      setStep("otp");
      setMessage("OTP sent (check your phone).");
    } catch (err) {
      setMessage(err.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (otp.join("").length !== 4) return;
    try {
      setMessage("");
      setLoading(true);
      const res = await verifyEmployerOtp({ phone, otp: otp.join(""), countryCode: "+91" });
      if (!res?.ok) throw new Error(res?.error?.message || "Verification failed");
      const route = res?.data?.next?.route || "/employee-dashboard";
      navigate(route);
    } catch (err) {
      setMessage(err.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const updateOtp = (val, index) => {
    if (!/^\d?$/.test(val)) return;
    const copy = [...otp];
    copy[index] = val;
    setOtp(copy);
    if (val && index < 3) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  return (
    <div className="min-h-screen bg-[#004D36] flex flex-col font-sans selection:bg-[#00ff9d]/30">
      <div className="bg-black/20 backdrop-blur-md border-b border-white/5 px-6 py-4 flex items-center justify-between">
        <button
          onClick={() => navigate(-1)}
          className="w-10 h-10 rounded-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/10 transition-all"
        >
          ←
        </button>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg shadow-black/20">
            <span className="text-[#004D36] font-black text-xs italic">KW</span>
          </div>
          <span className="font-black text-white uppercase tracking-tighter">
            Kaam<span className="text-white/40 italic font-medium">Wala</span>
          </span>
        </div>

        <div className="w-10"></div>
      </div>

      <div className="flex-1 flex items-center justify-center px-6 py-10">
        <div className="w-full max-w-md bg-black/30 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 p-8 md:p-12 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#00ff9d]/10 blur-[60px] rounded-full -mr-16 -mt-16" />

          <div className="flex justify-center mb-10">
            <div className="inline-flex items-center gap-2 bg-[#00ff9d]/10 border border-[#00ff9d]/20 px-5 py-2 rounded-full">
              <span className="text-lg">👷‍♂️</span>
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#00ff9d]">
                Employer Access
              </span>
            </div>
          </div>

          {step === "phone" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tighter">
                Welcome <br /> <span className="text-[#00ff9d] italic">Back.</span>
              </h2>
              <p className="text-white/40 text-sm text-center mb-10 font-medium">
                Enter your mobile number to continue
              </p>

              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-white/30 uppercase tracking-widest ml-1">
                    Mobile Identity
                  </label>
                  <div className="flex bg-white/5 border border-white/10 rounded-2xl overflow-hidden focus-within:border-[#00ff9d]/50 transition-all group">
                    <div className="px-5 flex items-center bg-white/5 text-white/40 font-bold border-r border-white/10 group-focus-within:text-[#00ff9d]">
                      🇮🇳 +91
                    </div>
                    <input
                      type="tel"
                      value={phone}
                      maxLength={10}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                      placeholder="00000 00000"
                      className="flex-1 bg-transparent px-5 py-5 text-white font-black tracking-widest outline-none placeholder:text-white/10"
                    />
                  </div>
                </div>

                <button
                  onClick={handleSendOtp}
                  disabled={loading || phone.length !== 10}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all duration-500
                  ${phone.length === 10
                    ? "bg-[#00ff9d] text-[#004D36] hover:shadow-[0_0_30px_-5px_rgba(0,255,157,0.4)] hover:-translate-y-1"
                    : "bg-white/5 text-white/20 cursor-not-allowed border border-white/5"}
                  `}
                >
                  {loading ? "Initializing..." : "Request Security Code →"}
                </button>

                {message ? (
                  <p className="text-xs font-bold text-white/60 text-center">{message}</p>
                ) : null}
              </div>
            </div>
          )}

          {step === "otp" && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <h2 className="text-3xl font-black text-white text-center mb-2 uppercase tracking-tighter">
                Verify <span className="text-[#00ff9d] italic">OTP.</span>
              </h2>
              <p className="text-white/40 text-sm text-center mb-10 font-medium">
                Sent to <span className="text-white font-bold">+91 {phone}</span>
              </p>

              <div className="flex justify-between gap-3 mb-10">
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="tel"
                    maxLength={10}
                    value={digit}
                    onChange={(e) => updateOtp(e.target.value.slice(-1), index)}
                    className="w-[22%] h-20 text-center text-3xl font-black bg-white/5 border border-white/10 rounded-2xl text-white focus:border-[#00ff9d] focus:bg-[#00ff9d]/5 outline-none transition-all"
                  />
                ))}
              </div>

              <button
                onClick={handleVerify}
                disabled={otp.join("").length !== 4 || loading}
                className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-xs transition-all duration-500
                ${otp.join("").length === 4
                  ? "bg-[#00ff9d] text-[#004D36] hover:shadow-[0_0_30px_-5px_rgba(0,255,157,0.4)] hover:-translate-y-1"
                  : "bg-white/5 text-white/20 cursor-not-allowed"}
                `}
              >
                {loading ? "Authorizing..." : "Complete Verification ✓"}
              </button>

              {message ? (
                <p className="text-xs font-bold text-white/60 text-center mt-4">{message}</p>
              ) : null}

              <button
                onClick={handleSendOtp}
                disabled={loading}
                className="w-full mt-4 text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors"
              >
                Resend OTP
              </button>

              <button
                onClick={() => setStep("phone")}
                className="w-full mt-6 text-[10px] font-black text-white/30 uppercase tracking-widest hover:text-white transition-colors"
              >
                Wrong Number? Edit
              </button>
            </div>
          )}
        </div>
      </div>

      <footer className="bg-black/20 py-6 border-t border-white/5">
        <div className="flex justify-center gap-10 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#00ff9d] rounded-full" /> AES-256 Encryption
          </span>
          <span className="flex items-center gap-2">
            <span className="w-1 h-1 bg-[#00ff9d] rounded-full" /> Secure Cloud
          </span>
        </div>
      </footer>
    </div>
  );
}

