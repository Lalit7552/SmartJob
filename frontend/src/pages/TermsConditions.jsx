import React from "react";
import { Link } from "react-router-dom";
import { Scale, Briefcase, Users, ShieldAlert, Gavel, RefreshCcw } from "lucide-react"; // npm i lucide-react

export default function TermsConditions() {
  return (
    <div className="min-h-screen bg-white text-black font-sans">
      {/* Top Banner */}
      <div className="bg-black py-20 px-6 text-center">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-white uppercase">
          Terms & <span className="text-emerald-500">Conditions</span>
        </h1>
        <p className="text-gray-400 mt-4 font-bold uppercase tracking-[0.3em] text-[10px]">
          Effective Date: March 2026
        </p>
      </div>

      <div className="max-w-4xl mx-auto px-6 -mt-10 mb-20">
        <div className="bg-white border border-gray-100 shadow-[0_50px_100px_-20px_rgba(0,0,0,0.05)] rounded-[3rem] p-8 md:p-16">
          
          <p className="text-xl font-medium text-gray-500 mb-12 italic border-b pb-8">
            By accessing the <span className="text-black font-bold">BlueCollar Platform</span>, you agree to adhere to the elite standards and legal frameworks outlined below.
          </p>

          <div className="prose prose-lg max-w-none space-y-12 text-gray-600 leading-relaxed">
            
            {/* 01. Platform Usage */}
            <section className="relative pl-8 border-l-2 border-emerald-500">
              <div className="absolute -left-3 top-0 bg-emerald-500 text-white p-1 rounded-full">
                <Briefcase size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                01. Platform Usage
              </h2>
              <p className="font-medium">
                Our platform serves as a high-integrity bridge between Workers and Employers. Users are 
                <span className="text-black font-bold"> legally obligated </span> to provide 100% accurate data 
                during registration and job postings to maintain the network's quality.
              </p>
            </section>

            {/* 02. User Responsibilities */}
            <section className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute -left-3 top-0 bg-black text-white p-1 rounded-full">
                <Users size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                02. User Responsibilities
              </h2>
              <p className="font-medium">
                Both parties are solely responsible for their conduct. All job agreements, financial negotiations, 
                and professional communications must be handled with the utmost transparency and respect 
                within the platform's ecosystem.
              </p>
            </section>

            {/* 03. Job Postings */}
            <section className="relative pl-8 border-l-2 border-emerald-500">
              <div className="absolute -left-3 top-0 bg-emerald-500 text-white p-1 rounded-full">
                <Scale size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                03. Job Postings
              </h2>
              <p className="font-medium">
                Employers must ensure all listings are genuine and comply with local labor laws. 
                <span className="text-red-600 font-bold uppercase ml-1">Zero Tolerance:</span> Any fraudulent 
                activity or misleading job descriptions will result in immediate permanent expulsion.
              </p>
            </section>

            {/* 04. Account Suspension */}
            <section className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute -left-3 top-0 bg-black text-white p-1 rounded-full">
                <ShieldAlert size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                04. Account Suspension
              </h2>
              <p className="font-medium">
                We reserve the unilateral right to suspend or terminate accounts that violate our community guidelines. 
                Misuse of platform tools or harassment will lead to an irrevocable ban.
              </p>
            </section>

            {/* 05. Limitation of Liability */}
            <section className="relative pl-8 border-l-2 border-emerald-500">
              <div className="absolute -left-3 top-0 bg-emerald-500 text-white p-1 rounded-full">
                <Gavel size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                05. Limitation of Liability
              </h2>
              <p className="font-medium italic">
                BlueCollar acts as a facilitator, not an employer. We are not liable for disputes, physical damages, 
                or financial losses arising from independent agreements between users.
              </p>
            </section>

            {/* 06. Changes to Terms */}
            <section className="relative pl-8 border-l-2 border-gray-200">
              <div className="absolute -left-3 top-0 bg-black text-white p-1 rounded-full">
                <RefreshCcw size={16} />
              </div>
              <h2 className="text-2xl font-black text-black uppercase tracking-tight mb-4">
                06. Changes to Terms
              </h2>
              <p className="font-medium">
                The digital landscape evolves, and so do we. We may update these terms periodically. 
                Continued use of the platform constitutes your legal acceptance of the revised protocol.
              </p>
            </section>

          </div>

          <div className="mt-20 p-10 bg-gray-50 rounded-[2rem] border border-gray-200 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h4 className="text-xl font-black text-black uppercase italic">Need Clarification?</h4>
              <p className="text-gray-500 text-sm font-medium">Our legal team is available for inquiries.</p>
            </div>
            <Link to="/contact" className="bg-emerald-500 text-white px-8 py-4 rounded-2xl font-bold hover:bg-black transition-all shadow-lg shadow-emerald-200">
              GET IN TOUCH
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}