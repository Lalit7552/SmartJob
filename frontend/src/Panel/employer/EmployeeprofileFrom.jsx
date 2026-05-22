import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { User, Building2, Mail, Phone, MapPin, Map, Camera, Briefcase, ChevronRight } from "lucide-react";
import { fetchEmployerProfile, saveEmployerProfile, updateEmployerProfile } from "../../api/employerApi";

export default function EmployerProfileForm() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    city: "",
    address: "",
    profilePhoto: null,
    companyLogo: null,
    existingProfilePhotoUrl: "",
    existingCompanyLogoUrl: "",
  });
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState("create");

  useEffect(() => {
    const authToken = localStorage.getItem("employerAuthToken");
    if (!authToken) return;

    let alive = true;
    async function loadProfile() {
      try {
        const res = await fetchEmployerProfile();
        const profile = res?.data?.data?.user?.profile || res?.data?.user?.profile || {};
        if (!alive) return;
        const userPhone = res?.data?.data?.user?.phone || res?.data?.user?.phone || "";
        const apiBase =
          import.meta.env.VITE_API_BASE_URL ||
          import.meta.env.VITE_BACKEND_URL ||
          "http://localhost:5000";
        const normalizeUrl = (value) => {
          if (!value) return "";
          if (value.startsWith("http")) return value;
          return `${apiBase.replace(/\/$/, "")}${value.startsWith("/") ? "" : "/"}${value}`;
        };

        setForm({
          firstName: profile?.name || "",
          lastName: profile?.companyName || "",
          email: profile?.email || "",
          phone: userPhone || "",
          city: profile?.city || "",
          address: profile?.address || "",
          profilePhoto: null,
          companyLogo: null,
          existingProfilePhotoUrl: normalizeUrl(profile?.profilePhoto || ""),
          existingCompanyLogoUrl: normalizeUrl(profile?.companyLogo || ""),
        });
        setMode("edit");
      } catch {
        setMode("edit");
      }
    }

    loadProfile();
    return () => {
      alive = false;
    };
  }, []);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: files ? files[0] : value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.firstName || !form.lastName) {
      alert("Please enter first name and last name");
      return;
    }

    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      alert("Please enter a valid email address");
      return;
    }

    if (form.phone && !/^\d{10}$/.test(form.phone.replace(/\D/g, ""))) {
      alert("Please enter a valid 10-digit mobile number");
      return;
    }

    const authToken = localStorage.getItem("employerAuthToken");
    const onboardingToken = localStorage.getItem("employerOnboardingToken");
    if (!authToken && !onboardingToken) {
      navigate("/employer-signup");
      return;
    }

    try {
      setLoading(true);
      const hasFiles = Boolean(form.profilePhoto || form.companyLogo);
      const payload = hasFiles ? new FormData() : {};

      if (hasFiles) {
        payload.append("name", form.firstName);
        payload.append("companyName", form.lastName);
        payload.append("lastName", form.lastName);
        if (form.email) payload.append("email", form.email);
        if (form.phone) payload.append("phone", form.phone);
        if (form.city) payload.append("city", form.city);
        if (form.address) payload.append("address", form.address);
        if (form.profilePhoto) payload.append("profilePhoto", form.profilePhoto);
        if (form.companyLogo) payload.append("companyLogo", form.companyLogo);
      } else {
        payload.name = form.firstName;
        payload.companyName = form.lastName;
        payload.lastName = form.lastName;
        payload.email = form.email;
        payload.phone = form.phone;
        payload.city = form.city;
        payload.address = form.address;
      }

      const res = authToken
        ? await updateEmployerProfile(payload)
        : await saveEmployerProfile(payload);
      const route = authToken ? "/employee/profile" : res?.data?.next?.route || "/employee-dashboard";
      navigate(route);
    } catch (err) {
      alert(err.message || "Failed to save profile");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] flex justify-center items-center p-4 md:p-8">
      <div className="w-full max-w-3xl bg-white shadow-[0_20px_50px_rgba(0,0,0,0.05)] rounded-[2rem] overflow-hidden border border-slate-100">
        
        {/* Top Header Section */}
        <div className="bg-[#0F172A] p-8 md:p-10 text-white relative overflow-hidden">
          <div className="relative z-10">
            <h2 className="text-3xl font-bold tracking-tight">Employer Profile</h2>
            <p className="text-slate-400 mt-2">Update your business identity and contact details</p>
          </div>
          <div className="absolute right-[-20px] top-[-20px] w-40 h-40 bg-blue-600/20 rounded-full blur-3xl"></div>
        </div>

        <form onSubmit={handleSubmit} className="p-8 md:p-10 space-y-8">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ImageUploadBox
              label="Profile Photo"
              name="profilePhoto"
              onChange={handleChange}
              icon={<Camera size={18} className="text-slate-600" />}
              fileName={form.profilePhoto?.name}
              accept="image/*"
              previewUrl={
                form.profilePhoto
                  ? URL.createObjectURL(form.profilePhoto)
                  : form.existingProfilePhotoUrl
              }
            />
          
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Full Name */}
            <InputGroup 
              label="Full Name" 
              icon={<User size={18} />} 
              name="firstName" 
              placeholder="John Doe" 
              value={form.firstName} 
              onChange={handleChange} 
            />

            {/* Last Name */}
            <InputGroup 
              label="Last Name" 
              icon={<Building2 size={18} />} 
              name="lastName" 
              placeholder="Doe" 
              value={form.lastName} 
              onChange={handleChange} 
            />

            {/* Email */}
            <InputGroup 
              label="Email Address" 
              icon={<Mail size={18} />} 
              name="email" 
              type="email"
              placeholder="john@company.com" 
              value={form.email} 
              onChange={handleChange} 
            />

            {/* Phone */}
            <InputGroup 
              label="Contact Number" 
              icon={<Phone size={18} />} 
              name="phone" 
              placeholder="+91 00000 00000" 
              value={form.phone} 
              onChange={handleChange} 
            />
          </div>

          {/* Location Details */}
          <div className="space-y-6">
            <InputGroup 
              label="City" 
              icon={<MapPin size={18} />} 
              name="city" 
              placeholder="Mumbai, Maharashtra" 
              value={form.city} 
              onChange={handleChange} 
            />

            <div className="flex flex-col space-y-2">
                <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">
                    <Map size={14} /> Official Address
                </label>
                <textarea
                  name="address"
                  placeholder="Street name, Building, Area..."
                  value={form.address}
                  onChange={handleChange}
                  className="w-full border-2 border-slate-100 rounded-2xl p-4 text-sm md:text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all min-h-[100px] bg-slate-50/50"
                />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-5 rounded-2xl font-bold text-lg shadow-xl shadow-blue-200 transition-all flex items-center justify-center gap-3 disabled:opacity-70 group"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                Updating Profile...
              </span>
            ) : (
              <>
                Save & Continue
                <ChevronRight className="group-hover:translate-x-1 transition-transform" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

/* UI Helper Component for Inputs */
function InputGroup({ label, icon, name, value, onChange, placeholder, type = "text" }) {
  return (
    <div className="flex flex-col space-y-2">
      <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider flex items-center gap-2">
        {label}
      </label>
      <div className="relative group">
        <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors">
          {icon}
        </div>
        <input
          type={type}
          name={name}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          className="w-full border-2 border-slate-100 rounded-2xl pl-12 pr-4 py-4 text-sm md:text-base focus:border-blue-500 focus:ring-4 focus:ring-blue-50 focus:bg-white outline-none transition-all bg-slate-50/50"
        />
      </div>
    </div>
  );
}

/* UI Helper Component for File Uploads */
function ImageUploadBox({ label, name, onChange, icon, fileName, accept, previewUrl }) {
    return (
        <div className="flex flex-col space-y-2">
            <label className="text-xs font-bold text-slate-500 uppercase ml-1 tracking-wider">{label}</label>
            <label className="relative flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-2xl p-4 hover:bg-blue-50 hover:border-blue-300 cursor-pointer transition-all bg-slate-50/30 group">
                <input type="file" name={name} onChange={onChange} accept={accept} className="hidden" />
                <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">
                    {previewUrl ? (
                      <img src={previewUrl} alt={label} className="w-10 h-10 object-cover rounded-lg" />
                    ) : (
                      icon
                    )}
                </div>
                <span className="text-xs font-medium text-slate-600 mt-2 truncate max-w-full px-2">
                    {fileName || "Click to upload"}
                </span>
            </label>
        </div>
    )
}
