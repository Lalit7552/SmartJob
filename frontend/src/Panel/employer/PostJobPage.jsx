import React, { useState, useEffect } from "react";
import {
  Briefcase,
  MapPin,
  IndianRupee,
  ChevronRight,
  PlusCircle,
} from "lucide-react";
import { State, City } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { createEmployerJob } from "../../api/employerApi";

export default function PostJobPage() {
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    country: "IN",
    state: "",
    city: "",
    title: "",
    category: "",
    type: "",
    address: "",
    minSalary: "",
    maxSalary: "",
    contactName: "",
    phone: "",
  });

  const [customCategory, setCustomCategory] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [phoneError, setPhoneError] = useState("");

  useEffect(() => {
    if (jobData.country) {
      setStates(State.getStatesOfCountry(jobData.country));
    }
  }, [jobData.country]);

  useEffect(() => {
    if (jobData.state) {
      setCities(City.getCitiesOfState(jobData.country, jobData.state));
    }
  }, [jobData.state, jobData.country]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "phone") {
      const digitsOnly = value.replace(/\D/g, "").slice(0, 10);
      setJobData({ ...jobData, phone: digitsOnly });
      if (phoneError) setPhoneError("");
      return;
    }
    setJobData({ ...jobData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const phoneDigits = String(jobData.phone || "").replace(/\D/g, "");
    if (phoneDigits.length !== 10) {
      setPhoneError("Enter a valid 10 digit mobile number.");
      return;
    }

    createEmployerJob({
      ...jobData,
      category:
        jobData.category === "Other" ? customCategory : jobData.category,
      status: "Active",
      applicants: 0,
    })
      .then(() => navigate("/employee/myjobs"))
      .catch((err) => {
        console.error("Job Create Error", err);
      });
  };

  return (
    <div className="min-h-screen bg-[#F1F5F9] py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border border-slate-200">
        
        {/* Header */}
        <div className="bg-[#0F172A] p-8 text-white flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Create Job Post</h1>
            <p className="text-slate-400 text-xs">Fill details to find workers</p>
          </div>
          <PlusCircle size={32} className="text-blue-500" />
        </div>

        <form className="p-8 space-y-8" onSubmit={handleSubmit}>

          {/* BASIC INFO */}
          <section>
            <SectionTitle icon={<Briefcase size={18} />} title="Basic Information" />

            <div className="space-y-4">

              <InputBlock
                label="Job Title"
                name="title"
                placeholder="e.g. Professional Driver for SUV"
                onChange={handleChange}
                value={jobData.title}
              />

              <div className="grid grid-cols-2 gap-4">

                <SelectBlock
                  label="Category"
                  name="category"
                  onChange={handleChange}
                  value={jobData.category}
                >
                  <option value="">Choose...</option>
                  <option>Electrician</option>
                  <option>Plumber</option>
                  <option>Driver</option>
                  <option value="Other">Other</option>
                </SelectBlock>

                <SelectBlock
                  label="Work Type"
                  name="type"
                  onChange={handleChange}
                  value={jobData.type}
                >
                  <option value="">Choose...</option>
                  <option>Full Time</option>
                  <option>Daily Wage</option>
                  <option>Contract</option>
                </SelectBlock>

              </div>

              {/* OTHER CATEGORY INPUT */}
              {jobData.category === "Other" && (
                <InputBlock
                  label="Custom Category"
                  placeholder="Enter Category"
                  value={customCategory}
                  onChange={(e) => setCustomCategory(e.target.value)}
                />
              )}

            </div>
          </section>

          {/* LOCATION */}
          <section>
            <SectionTitle icon={<MapPin size={18} />} title="Work Location" />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

              <SelectBlock
                label="State"
                name="state"
                onChange={handleChange}
                value={jobData.state}
              >
                <option value="">Select State</option>
                {states.map((s) => (
                  <option key={s.isoCode} value={s.isoCode}>
                    {s.name}
                  </option>
                ))}
              </SelectBlock>

              <SelectBlock
                label="City"
                name="city"
                onChange={handleChange}
                value={jobData.city}
              >
                <option value="">Select City</option>
                {cities.map((c) => (
                  <option key={c.name} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </SelectBlock>

            </div>

            <div className="mt-4">
              <InputBlock
                label="Specific Address"
                name="address"
                placeholder="Area, Landmark, House No."
                onChange={handleChange}
                value={jobData.address}
              />
            </div>

          </section>

          {/* SALARY & CONTACT */}
          <section>
            <SectionTitle icon={<IndianRupee size={18} />} title="Payment & Contact" />

            <div className="grid grid-cols-2 gap-4 mb-4">

              <InputBlock
                label="Min Salary"
                name="minSalary"
                placeholder="Rs 10,000"
                onChange={handleChange}
                value={jobData.minSalary}
              />

              <InputBlock
                label="Max Salary"
                name="maxSalary"
                placeholder="Rs 25,000"
                onChange={handleChange}
                value={jobData.maxSalary}
              />

            </div>

            <div className="grid grid-cols-2 gap-4">

              <InputBlock
                label="Your Name"
                name="contactName"
                placeholder="Your Name"
                onChange={handleChange}
                value={jobData.contactName}
              />

              <InputBlock
                label="Phone Number"
                name="phone"
                placeholder="9876543210"
                onChange={handleChange}
                value={jobData.phone}
                inputMode="numeric"
                maxLength={10}
              />
              {phoneError && (
                <p className="text-[10px] font-semibold text-red-500 mt-1 ml-1">
                  {phoneError}
                </p>
              )}

            </div>

          </section>

          {/* BUTTON */}
          <div className="pt-4">
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-5 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2"
            >
              Post this Requirement
              <ChevronRight size={20} />
            </button>
          </div>

        </form>
      </div>
    </div>
  );
}

/* UI COMPONENTS */

function SectionTitle({ icon, title }) {
  return (
    <div className="flex items-center gap-2 mb-4 border-b border-slate-100 pb-2">
      <span className="text-blue-600">{icon}</span>
      <h2 className="font-bold text-slate-800 uppercase text-xs tracking-widest">
        {title}
      </h2>
    </div>
  );
}

function InputBlock({ label, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
        {label}
      </label>
      <input
        {...props}
        className="w-full border-2 border-slate-200 p-3.5 rounded-xl text-slate-900 bg-white focus:border-blue-500 outline-none placeholder:text-slate-300"
      />
    </div>
  );
}

function SelectBlock({ label, children, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="text-[10px] font-bold text-slate-500 uppercase mb-1 ml-1">
        {label}
      </label>
      <select
        {...props}
        className="w-full border-2 border-slate-200 p-3.5 rounded-xl text-slate-900 bg-white focus:border-blue-500 outline-none"
      >
        {children}
      </select>
    </div>
  );
}
