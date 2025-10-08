"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { useRouter } from "next/navigation";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

type Job = {
  _id?: string;
  company: string;
  position: string;
  appliedAt: string;
  status: string;
};

const STATUS_OPTIONS = ["Applied", "Admitted", "Rejected", "HR Contacted", "User Interview"];
const COLORS = ["#3b82f6", "#eab308", "#ef4444", "#22c55e", "#800080"];

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [filter, setFilter] = useState("All");
  const [chartData, setChartData] = useState<any[]>([]);
  const [statusData, setStatusData] = useState<any[]>([]);
  const router = useRouter();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.info("Silakan login dulu ya!");
        setTimeout(() => router.push("/login"), 1000);
        return false;
      }
      return true;
    };

    if (checkAuth()) {
      loadJobs();
    }

    const interval = setInterval(() => {
      if (!localStorage.getItem("token")) {
        router.push("/login");
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // 🔹 Load jobs
  const loadJobs = async () => {
    const res = await fetch("/api/jobs", {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    });
    const data = await res.json();

    if (res.ok) {
      setJobs(data);
      generateChartData(data);
      generateStatusData(data);
    } else {
      toast.error(data.error || "Gagal memuat data");
    }
  };

  // 🔹 Add job
  const addJob = async () => {
    if (!company || !position) {
      toast.warning("Isi semua kolom dulu!");
      return;
    }

    const res = await fetch("/api/jobs/new", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ company, position }),
    });

    const data = await res.json();

    if (res.ok) {
      toast.success("Job berhasil ditambahkan!");
      setCompany("");
      setPosition("");
      loadJobs();
    } else {
      toast.error(data.error || "Gagal menambah job");
    }
  };

  // 🔹 Update status
  const updateStatus = async (id: string, newStatus: string) => {
    const res = await fetch(`/api/jobs/update`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id, status: newStatus }),
    });

    if (res.ok) {
      toast.info("Status berhasil diperbarui");
      loadJobs();
    } else {
      toast.error("Gagal update status");
    }
  };

  // 🔹 Delete job
  const deleteJob = async (id: string) => {
    const res = await fetch(`/api/jobs/delete`, {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${localStorage.getItem("token")}`,
      },
      body: JSON.stringify({ id }),
    });

    if (res.ok) {
      toast.success("Job berhasil dihapus!");
      loadJobs();
    } else {
      toast.error("Gagal menghapus job");
    }
  };

  // 🔹 Logout
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("name");
    toast.success("Berhasil logout!");
    setTimeout(() => router.push("/login"), 1000);
  };

  // 🔹 Chart Data
  const generateChartData = (allJobs: Job[]) => {
    const now = new Date();
    const past7Days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(now.getDate() - (6 - i));
      const day = d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      return { date: day, count: 0 };
    });

    allJobs.forEach((job) => {
      const jobDate = new Date(job.appliedAt);
      const formatted = jobDate.toLocaleDateString("en-US", { month: "short", day: "numeric" });
      const found = past7Days.find((d) => d.date === formatted);
      if (found) found.count += 1;
    });

    setChartData(past7Days);
  };

  const generateStatusData = (allJobs: Job[]) => {
    const statusCount = STATUS_OPTIONS.map((status) => ({
      name: status,
      value: allJobs.filter((j) => j.status === status).length,
    }));
    setStatusData(statusCount);
  };

  const filteredJobs = filter === "All" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div className="min-h-screen bg-[#111] text-white font-mono p-10 flex flex-col relative ">
      <button
        onClick={handleLogout}
        className="absolute top-6 right-6 bg-red-600 hover:bg-yellow-500 px-4 py-2 rounded-lg font-bold border-2 border-black text-white transition-all"
      >
        Logout
      </button>

      <h1 className="text-5xl font-extrabold text-center mb-10 uppercase tracking-widest text-yellow-400 drop-shadow-[4px_4px_0px_#ff0080]">
        Job Tracker
      </h1>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-8 mb-10">
        <div className="bg-black/70 border-4 border-pink-500 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-yellow-400 mb-4 text-center">
            Applications in the Last 7 Days
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#333" />
              <XAxis dataKey="date" stroke="#fff" />
              <YAxis stroke="#fff" allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #555", color: "#fff" }} />
              <Bar dataKey="count" fill="#facc15" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-black/70 border-4 border-yellow-400 rounded-xl p-6">
          <h2 className="text-2xl font-bold text-pink-400 mb-4 text-center">
             Aplication progress 
          </h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={90} dataKey="value" label>
                {statusData.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ backgroundColor: "#000", border: "1px solid #555", color: "#fff" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Add Job */}
      <div className="flex flex-wrap gap-4 mb-8 justify-center">
        <input
          type="text"
          placeholder="Company"
          value={company}
          onChange={(e) => setCompany(e.target.value)}
          className="border-4 border-yellow-400 bg-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-pink-500 placeholder-gray-500 w-1/3"
        />
        <input
          type="text"
          placeholder="Position"
          value={position}
          onChange={(e) => setPosition(e.target.value)}
          className="border-4 border-pink-500 bg-black text-white px-4 py-3 rounded-lg focus:outline-none focus:ring-4 focus:ring-yellow-400 placeholder-gray-500 w-1/3"
        />
        <button
          onClick={addJob}
          className="px-6 py-3 bg-yellow-400 text-black font-bold rounded-lg hover:bg-pink-500 hover:text-white transition-all border-4 border-black"
        >
          + ADD JOB
        </button>
      </div>

      {/* Filter */}
      <div className="flex justify-end mb-4">
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-black border-4 border-pink-500 text-yellow-400 px-4 py-2 rounded-lg focus:ring-4 focus:ring-yellow-400"
        >
          <option value="All">ALL STATUS</option>
          {STATUS_OPTIONS.map((status) => (
            <option key={status} value={status}>
              {status.toUpperCase()}
            </option>
          ))}
        </select>
      </div>

      {/* Table */}
      <div className="overflow-x-auto border-4 border-yellow-400 rounded-xl bg-black/70">
        <table className="w-full text-left text-lg">
          <thead className="bg-yellow-400 text-black uppercase font-bold">
            <tr>
              <th className="p-4">Company</th>
              <th className="p-4">Position</th>
              <th className="p-4">Applied</th>
              <th className="p-4">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center p-8 text-gray-400">
                  No jobs found
                </td>
              </tr>
            ) : (
              filteredJobs.map((job) => (
                <tr key={job._id} className="border-b border-gray-700 hover:bg-yellow-400/10 transition-all">
                  <td className="p-4">{job.company}</td>
                  <td className="p-4">{job.position}</td>
                  <td className="p-4">{new Date(job.appliedAt).toLocaleDateString()}</td>
                  <td className="p-4">
                    <select
                      value={job.status}
                      onChange={(e) => updateStatus(job._id as string, e.target.value)}
                      className="px-3 py-2 rounded-lg font-bold border-2"
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt} value={opt} className="bg-black text-white">
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-center flex justify-center gap-3">
                    <a
                      href={`/job/${job._id}`}
                      className="bg-pink-500 hover:bg-yellow-400 text-black px-4 py-2 rounded-lg font-bold border-2 border-black transition-all"
                    >
                      VIEW DETAIL
                    </a>
                    <button
                      onClick={() => deleteJob(job._id as string)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-bold border-2 border-black transition-all"
                    >
                      DELETE
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <ToastContainer position="top-right" autoClose={2000} hideProgressBar />
    </div>
  );
}
