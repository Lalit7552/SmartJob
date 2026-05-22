import React from "react";
import { Link } from "react-router-dom";

export default function LandingPage() {
  const categories = [
    { name: "Driver", icon: "🚗", desc: "Professional Chauffeurs" },
    { name: "Cook", icon: "👨‍🍳", desc: "Expert Home Chefs" },
    { name: "Guard", icon: "🛡️", desc: "Certified Security" },
    { name: "Electrician", icon: "💡", desc: "Technical Support" },
    { name: "Plumber", icon: "🔧", desc: "Plumbing Solutions" },
    { name: "Maid", icon: "🧹", desc: "Housekeeping" },
  ];

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      
      {/* --- Premium Navigation --- */}
      <header className="sticky top-0 z-50 bg-white/70 backdrop-blur-xl border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex justify-between items-center">
          <div className="flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 bg-black rounded-lg flex items-center justify-center group-hover:bg-emerald-600 transition-colors duration-500">
              <span className="text-white font-black text-xl italic">B</span>
            </div>
            <h1 className="text-2xl font-black tracking-tighter text-black uppercase">
              Blue<span className="text-emerald-600">Collar</span>
            </h1>
          </div>

          <nav className="hidden md:flex items-center gap-10 text-[13px] font-bold uppercase tracking-widest text-gray-500">
            <Link to="/" className="hover:text-black transition-colors">Home</Link>
            <Link to="/terms-conditions" className="hover:text-black transition-colors">Terms & Condition</Link>
            <Link to="/privacy-policy" className="hover:text-black transition-colors">Privacy & Policy</Link>
            {/* <Link to="/worker-login" className="hover:text-black transition-colors">Login</Link> */}
          </nav>

          <Link
            to="/role-select"
            className="bg-black text-white px-8 py-3 rounded-full text-sm font-bold hover:bg-emerald-700 hover:shadow-2xl hover:shadow-emerald-200 transition-all active:scale-95"
          >
            JOIN NOW
          </Link>
        </div>
      </header>

      {/* --- Hero: Bold & Minimalist --- */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          <div className="space-y-8">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-100">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-black uppercase tracking-[0.2em] text-emerald-700">Premium Workforce</span>
            </div>
            
            <h2 className="text-6xl md:text-8xl font-black text-black leading-[0.9] tracking-tighter">
              QUALITY <br /> 
              <span className="text-emerald-600">MEETS</span> <br /> 
              TRUST.
            </h2>
            
            <p className="text-lg text-gray-500 max-w-md leading-relaxed font-medium">
              A curated platform for high-skilled professionals. Hire verified expertise for your premium lifestyle needs.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Link
                to="/employer-signup"
                className="bg-black text-white px-10 py-5 rounded-2xl font-bold shadow-2xl hover:bg-emerald-950 transition-all text-center flex items-center justify-center gap-3"
              >
                Hire Professional
                <span className="text-emerald-400">→</span>
              </Link>
              <Link
                to="/worker-signup"
                className="bg-white border-2 border-black text-black px-10 py-5 rounded-2xl font-bold hover:bg-black hover:text-white transition-all text-center"
              >
                Apply as Expert
              </Link>
            </div>
          </div>

          <div className="relative">
            {/* Geometric Background Element */}
            <div className="absolute -inset-10 bg-emerald-100 rounded-[4rem] -rotate-6 z-0" />
            <div className="relative z-10 rounded-[3rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.3)] border-[12px] border-white">
              <img
                src="https://images-eds-ssl.xboxlive.com/image?url=4rt9.lXDC4H_93laV1_eHHFT949fUipzkiFOBH3fAiZZUCdYojwUyX2aTonS1aIwMrx6NUIsHfUHSLzjGJFxxrTIBuBZizatHdyqsYy9gTb9aW9fHPANgdtp5VXcDfDu_ojK88xUsjbPVPffzXiA.rOhFsYsqvtWttBQUL.yDGk-&format=source"
                alt="Expert Worker"
                className="w-full h-[600px] object-cover grayscale-[0.2] hover:grayscale-0 transition-all duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute bottom-10 left-10 text-white">
                <p className="text-4xl font-black">50k+</p>
                <p className="text-sm font-bold uppercase tracking-widest text-emerald-400">Verified Pros</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- Categories: Dark Luxury Style --- */}
      <section className="bg-black py-32 rounded-[4rem] mx-4 mb-10 overflow-hidden relative">
        {/* Subtle Gradient background */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-900/20 rounded-full blur-[120px]" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 gap-6">
            <div className="space-y-4">
              <h3 className="text-4xl md:text-5xl font-black text-white leading-tight">
                Our Specialized <br /> Departments
              </h3>
            </div>
            <p className="text-gray-400 max-w-xs font-medium border-l-2 border-emerald-600 pl-6">
              Every professional undergoes a 5-step verification process to ensure your safety.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="group bg-zinc-900/50 border border-zinc-800 p-10 rounded-3xl hover:bg-emerald-600 transition-all duration-500 cursor-pointer"
              >
                <div className="text-5xl mb-8 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
                  {cat.icon}
                </div>
                <h4 className="text-2xl font-black text-white mb-2 uppercase tracking-tighter">
                  {cat.name}
                </h4>
                <p className="text-zinc-500 group-hover:text-emerald-100 transition-colors font-medium">
                  {cat.desc}
                </p>
                <div className="mt-8 w-12 h-[2px] bg-emerald-600 group-hover:bg-white transition-colors" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* --- CTA: Emerald Gradient --- */}
      <section className="px-6 py-20">
        <div className="max-w-5xl mx-auto bg-gradient-to-br from-emerald-600 to-emerald-900 rounded-[3rem] p-12 md:p-24 text-center shadow-2xl shadow-emerald-200">
          <h3 className="text-4xl md:text-6xl font-black text-white mb-10 tracking-tighter">
            Elevate your lifestyle <br /> with better help.
          </h3>
          <Link
            to="/worker-signup"
            className="inline-block bg-black text-white px-12 py-5 rounded-full font-black text-lg hover:scale-105 transition-all shadow-xl"
          >
            GET STARTED TODAY
          </Link>
        </div>
      </section>

      {/* --- Minimal Footer --- */}
      <footer className="bg-white text-black py-20 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-10">
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-black italic tracking-tighter">BLUECOLLAR</h2>
            <p className="text-gray-400 text-sm mt-2 font-medium uppercase tracking-[0.3em]">The Gold Standard</p>
          </div>
          
          <div className="flex gap-12 text-[11px] font-black uppercase tracking-widest text-gray-500">
            <Link to="/about" className="hover:text-emerald-600 transition-colors">About</Link>
            <Link to="/privacy" className="hover:text-emerald-600 transition-colors">Privacy</Link>
            <Link to="/contact" className="hover:text-emerald-600 transition-colors">Support</Link>
          </div>

          <p className="text-[11px] font-bold text-gray-400 tracking-widest uppercase">
            © 2026 Luxury Service Platform
          </p>
        </div>
      </footer>
    </div>
  );
}