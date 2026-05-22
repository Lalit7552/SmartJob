
import React, { useState, useEffect } from "react";
import { ChevronRight } from "lucide-react";
import { State, City } from "country-state-city";
import { useNavigate } from "react-router-dom";
import { createEmployerJob } from "../../api/employerApi";

export default function OneDayJobPageform() {
  const navigate = useNavigate();

  const [jobData, setJobData] = useState({
    country: "IN",
    state: "",
    city: "",
    title: "",
    category: "",
    address: "",
    date: "",
    startTime: "",
    endTime: "",
    payment: "",
    contactName: "",
    phone: "",
  });

  const [customCategory, setCustomCategory] = useState("");
  const [states, setStates] = useState([]);
  const [cities, setCities] = useState([]);
  const [errors, setErrors] = useState({});
  const [alert, setAlert] = useState(null);

  useEffect(() => {
    setStates(State.getStatesOfCountry("IN"));
  }, []);

  useEffect(() => {
    if (jobData.state) {
      setCities(City.getCitiesOfState("IN", jobData.state));
    }
  }, [jobData.state]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setJobData({ ...jobData, [name]: value });
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }
  };

  const handleDigitsOnlyChange = (field, maxLen) => (e) => {
    const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, maxLen);
    setJobData((prev) => ({ ...prev, [field]: digitsOnly }));
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  };

  const validate = () => {
    const nextErrors = {};

    if (!jobData.title.trim()) nextErrors.title = "Job title is required.";
    if (!jobData.category) nextErrors.category = "Category is required.";
    if (jobData.category === "Other" && !customCategory.trim()) {
      nextErrors.customCategory = "Please enter a category.";
    }
    if (!jobData.state) nextErrors.state = "State is required.";
    if (!jobData.city) nextErrors.city = "City is required.";
    if (!jobData.address.trim()) nextErrors.address = "Address is required.";
    if (!jobData.date) nextErrors.date = "Work date is required.";
    if (!jobData.startTime) nextErrors.startTime = "Start time is required.";
    if (!jobData.endTime) nextErrors.endTime = "End time is required.";
    if (jobData.startTime && jobData.endTime && jobData.endTime <= jobData.startTime) {
      nextErrors.endTime = "End time must be after start time.";
    }
    if (!jobData.payment.trim()) {
      nextErrors.payment = "Total payment is required.";
    } else if (!Number.isFinite(Number(jobData.payment))) {
      nextErrors.payment = "Enter a valid number.";
    }
    if (!jobData.contactName.trim()) {
      nextErrors.contactName = "Contact name is required.";
    }
    if (!jobData.phone.trim()) {
      nextErrors.phone = "Phone number is required.";
    } else if (!/^\d{10}$/.test(jobData.phone.trim())) {
      nextErrors.phone = "Enter a 10-digit phone number.";
    }

    return nextErrors;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const nextErrors = validate();
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      setAlert({ type: "error", message: "Please fix the highlighted fields." });
      return;
    }

    setErrors({});
    setAlert(null);

    const finalCategory =
      jobData.category === "Other" ? customCategory : jobData.category;

    createEmployerJob({
      ...jobData,
      category: finalCategory,
      type: "One Day Job",
      status: "Active",
      applicants: 0,
    })
      .then(() => navigate("/employer/one-dayjob"))
      .catch((err) => {
        console.log(err);
        setAlert({ type: "error", message: "Something went wrong. Please try again." });
      });
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-3xl mx-auto bg-white rounded-3xl shadow-xl border">

        {/* Header */}
        <div className="bg-slate-900 text-white p-8 rounded-t-3xl">
          <h1 className="text-2xl font-bold">Post One Day Job</h1>
          <p className="text-xs text-slate-400">Hire worker for single day</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          {alert && (
            <div
              className={`rounded-lg px-4 py-3 text-sm font-semibold ${
                alert.type === "error"
                  ? "bg-red-50 text-red-700 border border-red-200"
                  : "bg-green-50 text-green-700 border border-green-200"
              }`}
            >
              {alert.message}
            </div>
          )}

          <InputBlock
            label="Job Title"
            name="title"
            placeholder="Example: AC Repair Needed"
            value={jobData.title}
            onChange={handleChange}
            error={errors.title}
          />

          {/* CATEGORY */}
          <SelectBlock
            label="Category"
            name="category"
            value={jobData.category}
            onChange={handleChange}
            error={errors.category}
          >
            <option value="">Select Category</option>
            <option>Electrician</option>
            <option>Plumber</option>
            <option>Driver</option>
            <option>Carpenter</option>
            <option>Painter</option>
            <option>AC Technician</option>
            <option value="Other">Other</option>
          </SelectBlock>

          {jobData.category === "Other" && (
            <InputBlock
              label="Add Category"
              placeholder="Enter Category"
              value={customCategory}
              onChange={(e) => {
                setCustomCategory(e.target.value);
                if (errors.customCategory) {
                  setErrors((prev) => {
                    const next = { ...prev };
                    delete next.customCategory;
                    return next;
                  });
                }
              }}
              error={errors.customCategory}
            />
          )}

          {/* LOCATION */}
          <div className="grid grid-cols-2 gap-4">

            <SelectBlock
              label="State"
              name="state"
              value={jobData.state}
              onChange={handleChange}
              error={errors.state}
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
              value={jobData.city}
              onChange={handleChange}
              error={errors.city}
            >
              <option value="">Select City</option>
              {cities.map((c) => (
                <option key={c.name} value={c.name}>
                  {c.name}
                </option>
              ))}
            </SelectBlock>

          </div>

          <InputBlock
            label="Address"
            name="address"
            placeholder="Area, landmark, house no."
            value={jobData.address}
            onChange={handleChange}
            error={errors.address}
          />

          {/* DATE */}
          <InputBlock
            label="Work Date"
            type="date"
            name="date"
            value={jobData.date}
            onChange={handleChange}
            error={errors.date}
          />

          {/* TIME */}
          <div className="grid grid-cols-2 gap-4">

            <InputBlock
              label="Start Time"
              type="time"
              name="startTime"
              value={jobData.startTime}
              onChange={handleChange}
              error={errors.startTime}
            />

            <InputBlock
              label="End Time"
              type="time"
              name="endTime"
              value={jobData.endTime}
              onChange={handleChange}
              error={errors.endTime}
            />

          </div>

            <InputBlock
              label="Total Payment"
              name="payment"
              placeholder="Rs 1500"
              value={jobData.payment}
              onChange={handleDigitsOnlyChange("payment", 7)}
              inputMode="numeric"
              maxLength={7}
              error={errors.payment}
            />

          {/* CONTACT */}
          <div className="grid grid-cols-2 gap-4">

            <InputBlock
              label="Contact Name"
              name="contactName"
              placeholder="Your Name"
              value={jobData.contactName}
              onChange={handleChange}
              error={errors.contactName}
            />

            <InputBlock
              label="Phone"
              name="phone"
              placeholder="9876543210"
              value={jobData.phone}
              onChange={handleDigitsOnlyChange("phone", 10)}
              inputMode="numeric"
              maxLength={10}
              error={errors.phone}
            />

          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 hover:bg-blue-700"
          >
            Post One Day Job
            <ChevronRight size={18} />
          </button>

        </form>
      </div>
    </div>
  );
}

/* INPUT COMPONENT */

function InputBlock({ label, error, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-slate-600 mb-1">
        {label}
      </label>
      <input
        {...props}
        className={`border p-3 rounded-lg outline-none text-slate-900 bg-white ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
        }`}
      />
      {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
    </div>
  );
}

/* SELECT COMPONENT */

function SelectBlock({ label, children, error, ...props }) {
  return (
    <div className="flex flex-col">
      <label className="text-xs font-semibold text-slate-600 mb-1">
        {label}
      </label>
      <select
        {...props}
        className={`border p-3 rounded-lg outline-none bg-white text-slate-900 ${
          error ? "border-red-400 focus:border-red-500" : "border-slate-300 focus:border-blue-500"
        }`}
      >
        {children}
      </select>
      {error && <span className="text-xs text-red-600 mt-1">{error}</span>}
    </div>
  );
}
