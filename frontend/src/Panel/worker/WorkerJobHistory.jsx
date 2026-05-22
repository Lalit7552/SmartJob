import { Calendar, Building2, Star } from "lucide-react";

export default function WorkerJobHistory() {
  const history = [
    {
      id: 1,
      title: "AC Wiring - 3BHK",
      client: "Mehta Family",
      date: "Feb 28, 2025",
      amount: "₹1,800",
      status: "Completed",
      rating: 5,
    },
    {
      id: 2,
      title: "Office Rewiring",
      client: "StartUp Hub",
      date: "Feb 20, 2025",
      amount: "₹4,200",
      status: "Completed",
      rating: 5,
    },
    {
      id: 3,
      title: "MCB Replacement",
      client: "Priya Sharma",
      date: "Feb 14, 2025",
      amount: "₹600",
      status: "Completed",
      rating: 4,
    },
    {
      id: 4,
      title: "Generator Install",
      client: "Royal Hotel",
      date: "Feb 05, 2025",
      amount: "₹3,500",
      status: "Completed",
      rating: 5,
    },
    {
      id: 5,
      title: "Tube Light Fitting",
      client: "Rajesh Gupta",
      date: "Jan 28, 2025",
      amount: "₹400",
      status: "Cancelled",
      rating: 0,
    },
  ];

  return (
    <div className="flex-1 bg-[#0a0f0d] text-white overflow-y-auto">
      {/* --- Header & Summary --- */}
      <div className="p-6 pt-10">
        <h1 className="text-2xl font-black tracking-tight">Job History</h1>
        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-[0.2em] mt-1">
          Total 5 jobs · 4 completed
        </p>

        {/* Stats Summary Card */}
        <div className="mt-6 bg-gradient-to-br from-[#0d2b1f] to-[#0a1511] border border-emerald-500/10 rounded-[2.5rem] p-8 shadow-2xl">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="space-y-1">
              <h2 className="text-xl font-black text-emerald-400 uppercase tracking-tighter">₹48,200</h2>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Total Earned</p>
            </div>
            <div className="space-y-1 border-x border-white/5">
              <h2 className="text-xl font-black text-slate-200 uppercase tracking-tighter">₹8,400</h2>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">This Month</p>
            </div>
            <div className="space-y-1">
              <h2 className="text-xl font-black text-slate-200 uppercase tracking-tighter">₹680</h2>
              <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest leading-none">Avg/Day</p>
            </div>
          </div>
        </div>
      </div>

      {/* --- History List --- */}
      <div className="px-6 pb-32 space-y-4">
        {history.map((job) => (
          <div key={job.id} className="bg-[#121a17] border border-white/5 p-6 rounded-[2rem] relative group active:scale-[0.98] transition-all">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-md font-black tracking-tight">{job.title}</h3>
                <div className="mt-2 space-y-1.5">
                  <p className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                    <Building2 size={12} className="text-emerald-500" /> {job.client}
                  </p>
                  <p className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase">
                    <Calendar size={12} className="text-rose-500" /> {job.date}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <p className="text-lg font-black text-emerald-400 tracking-tighter leading-none mb-2">{job.amount}</p>
                <span className={`px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border
                  ${job.status === "Completed" 
                    ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-500 border-rose-500/20"
                  }`}
                >
                  {job.status}
                </span>

                {/* Star Ratings */}
                {job.status === "Completed" && (
                  <div className="flex justify-end gap-0.5 mt-3">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={10} 
                        fill={i < job.rating ? "#fbbf24" : "transparent"} 
                        className={i < job.rating ? "text-amber-400" : "text-slate-700"} 
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}