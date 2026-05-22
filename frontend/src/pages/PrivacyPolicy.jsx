import React from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Eye, Lock, UserCheck } from "lucide-react"; // npm i lucide-react

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Top Banner */}
      <div className="bg-black py-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">
          Privacy <span className="text-emerald-500">Policy</span>
        </h1>
        <p className="text-gray-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
          Last Updated: March 2026
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 mb-20">
        <div className="bg-white border border-gray-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] rounded-[3rem] p-8 md:p-16">
          
          <div className="prose prose-lg max-w-none space-y-12 text-gray-600 leading-relaxed">
            
            <section className="relative pl-8 border-l-2 border-emerald-500">
              <div className="absolute -left-3 top-0 bg-emerald-500 text-white p-1 rounded-full">
                <Eye size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                01. Information We Collect
              </h2>
              <p className="font-medium">
                In our pursuit of excellence, we collect only necessary data: professional certifications, 
                biometric verification (for security), and contact details. This ensures the 
                <span className="text-black font-bold"> BlueCollar Gold Standard</span> is maintained.
              </p>
            </section>

            <section className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute -left-3 top-0 bg-black text-white p-1 rounded-full">
                <UserCheck size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                02. How We Use Information
              </h2>
              <p className="font-medium">
                Your data is used to curate matches between Elite Employers and Expert Professionals. 
                We use location intelligence to optimize service delivery and enhance platform security.
              </p>
            </section>

            <section className="relative pl-8 border-l-2 border-emerald-500">
              <div className="absolute -left-3 top-0 bg-emerald-500 text-white p-1 rounded-full">
                <ShieldCheck size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                03. Data Security
              </h2>
              <p className="font-medium">
                We employ military-grade encryption for all data at rest and in transit. 
                Your personal details are stored in high-security vaults, inaccessible to unauthorized third parties.
              </p>
            </section>

            <section className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute -left-3 top-0 bg-black text-white p-1 rounded-full">
                <Lock size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                04. Information Sharing
              </h2>
              <p className="font-medium italic">
                "Privacy is the ultimate luxury." We do not sell, trade, or rent user data. 
                Information is only shared between the hiring party and the expert after mutual consent.
              </p>
            </section>

          </div>

          <div className="mt-20 p-10 bg-emerald-50 rounded-[2rem] border border-emerald-100 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-black text-emerald-900 uppercase italic">Have Questions?</h4>
              <p className="text-emerald-700 text-sm font-medium">Our privacy concierge is here to help.</p>
            </div>
            <Link to="/contact" className="bg-black text-white px-8 py-4 rounded-2xl font-bold hover:bg-emerald-800 transition-all">
              CONTACT SUPPORT
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}