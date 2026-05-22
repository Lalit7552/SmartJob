import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Trash2, ShieldAlert, Smartphone, KeyRound, ArrowRight, X } from "lucide-react";

const DeleteAccount = ({ setUser }) => {
  const navigate = useNavigate();
  const [mobile, setMobile] = useState("");
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpMessage, setOtpMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const sendOtp = () => {
    setError("");
    if (!mobile || mobile.length < 10) {
      setError("Please enter a valid mobile number");
      return;
    }

    setLoading(true);
    setTimeout(() => {
      const otpCode = Math.floor(100000 + Math.random() * 900000);
      setGeneratedOtp(otpCode);
      setOtpSent(true);
      setOtpMessage(`Verification code: ${otpCode}`);
      setLoading(false);
    }, 800);
  };

  const handleDelete = (e) => {
    e.preventDefault();
    setError("");

    if (Number(otp) !== generatedOtp) {
      setError("The verification code is incorrect.");
      return;
    }

    setSuccess(true);
    setTimeout(() => {
      localStorage.removeItem("user");
      if (setUser) setUser(null);
      navigate("/");
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-white text-black font-sans flex items-center justify-center p-6">
      <div className="w-full max-w-lg">
        
        {/* Main Card */}
        <div className="bg-white border border-gray-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.08)] rounded-[3rem] overflow-hidden">
          
          {/* Danger Header */}
          <div className="bg-black py-12 px-8 text-center relative">
            <button 
              onClick={() => navigate(-1)}
              className="absolute right-6 top-6 text-gray-500 hover:text-white transition-colors"
            >
              <X size={24} />
            </button>
            <div className="inline-flex items-center justify-center w-20 h-20 bg-emerald-500 text-black rounded-3xl rotate-12 mb-6">
              <ShieldAlert size={40} className="-rotate-12" />
            </div>
            <h1 className="text-4xl font-black tracking-tighter text-white uppercase">
              Delete <span className="text-emerald-500">Account</span>
            </h1>
            <p className="text-gray-400 mt-2 font-bold uppercase tracking-widest text-[10px]">
              Final Security Verification
            </p>
          </div>

          <div className="p-8 md:p-12">
            {/* Warning Message */}
          

            {/* Status Messages */}
            {error && (
              <div className="mb-8 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs font-bold uppercase tracking-wider animate-bounce">
                {error}
              </div>
            )}

            {success && (
              <div className="mb-8 p-8 bg-emerald-50 border border-emerald-100 rounded-3xl text-emerald-700 text-center">
                <div className="font-black text-2xl mb-2 uppercase">Protocol Initiated</div>
                <p className="font-medium text-sm">Purging user data... Redirecting to home.</p>
              </div>
            )}

            {!success && (
              <form onSubmit={handleDelete} className="space-y-8">
                
                {/* Mobile Input */}
                <div className="relative pl-8 border-l-2 border-emerald-500">
                  <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                    01. Registered Mobile
                  </label>
                  <div className="relative group">
                    <div className="absolute inset-y-0 left-0 flex items-center text-black">
                      <Smartphone size={20} />
                    </div>
                    <input
                      type="tel"
                      value={mobile}
                      onChange={(e) => setMobile(e.target.value)}
                      placeholder="ENTER PHONE NUMBER"
                      className="block w-full pl-8 pr-32 py-4 border-b-2 border-gray-100 focus:border-black outline-none transition-all font-bold text-lg placeholder:text-gray-200"
                    />
                    <button
                      type="button"
                      onClick={sendOtp}
                      disabled={loading}
                      className="absolute right-0 top-1/2 -translate-y-1/2 bg-black text-white px-6 py-2 rounded-xl text-[10px] font-black tracking-widest hover:bg-emerald-500 hover:text-black transition-all disabled:opacity-30"
                    >
                      {loading ? "SENDING..." : otpSent ? "RESEND" : "GET CODE"}
                    </button>
                  </div>
                </div>

                {/* OTP Input */}
                {otpSent && (
                  <div className="relative pl-8 border-l-2 border-gray-200 animate-in fade-in slide-in-from-top-4 duration-500">
                    <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">
                      02. Security Code
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-y-0 left-0 flex items-center text-black">
                        <KeyRound size={20} />
                      </div>
                      <input
                        type="text"
                        maxLength="6"
                        value={otp}
                        onChange={(e) => setOtp(e.target.value)}
                        placeholder="000000"
                        className="block w-full pl-8 py-4 border-b-2 border-gray-100 focus:border-emerald-500 outline-none transition-all tracking-[0.5em] font-black text-2xl placeholder:text-gray-100"
                      />
                    </div>
                    {otpMessage && (
                      <p className="mt-2 text-[10px] font-bold text-emerald-600 italic uppercase tracking-tighter">
                        {otpMessage}
                      </p>
                    )}
                  </div>
                )}

                {/* Submit Action */}
                <div className="pt-6">
                  <button
                    type="submit"
                    disabled={!otpSent || success}
                    className={`w-full group flex items-center justify-between px-10 py-6 rounded-[2rem] font-black text-white transition-all transform active:scale-[0.95] shadow-2xl ${
                      otpSent 
                        ? "bg-black hover:bg-emerald-600 shadow-emerald-100" 
                        : "bg-gray-100 cursor-not-allowed text-gray-300 shadow-none"
                    }`}
                  >
                    <span className="uppercase tracking-widest text-sm">Confirm Termination</span>
                    <Trash2 size={24} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
              </form>
            )}

           
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteAccount;