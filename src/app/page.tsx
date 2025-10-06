"use client";

import { useEffect, useState } from "react";

type Job = {
  _id?: string;
  company: string;
  position: string;
  appliedAt: string;
  status: string;
};

const STATUS_OPTIONS = ["Applied", "Not Responded", "Rejected", "HR Contacted"];

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [company, setCompany] = useState("");
  const [position, setPosition] = useState("");
  const [filter, setFilter] = useState("All");

  const loadJobs = async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data);
  };

  useEffect(() => {
    loadJobs();
  }, []);

  const addJob = async () => {
    if (!company || !position) return alert("Isi semua kolom dulu!");

    await fetch("/api/jobs/new", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ company, position }),
    });

    setCompany("");
    setPosition("");
    loadJobs();
  };

  const updateStatus = async (id: string, newStatus: string) => {
    await fetch(`/api/jobs/update`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: newStatus }),
    });
    loadJobs();
  };

  const deleteJob = async (id: string) => {
    if (!confirm("Yakin mau hapus job ini?")) return;
    await fetch(`/api/jobs/delete`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    loadJobs();
  };

  const filteredJobs =
    filter === "All" ? jobs : jobs.filter((j) => j.status === filter);

  return (
    <div className="min-h-screen bg-[#111] text-white font-mono p-10 flex flex-col">
      <h1 className="text-5xl font-extrabold text-center mb-10 uppercase tracking-widest text-yellow-400 drop-shadow-[4px_4px_0px_#ff0080]">
        Job Tracker ⚡
      </h1>

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
                <tr
                  key={job._id}
                  className="border-b border-gray-700 hover:bg-yellow-400/10 transition-all"
                >
                  <td className="p-4">{job.company}</td>
                  <td className="p-4">{job.position}</td>
                  <td className="p-4">
                    {new Date(job.appliedAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                    <select
                      value={job.status}
                      onChange={(e) =>
                        updateStatus(job._id as string, e.target.value)
                      }
                      className={`px-3 py-2 rounded-lg font-bold border-2 transition-all ${
                        job.status === "Rejected"
                          ? "border-red-500 bg-red-600/20 text-red-400"
                          : job.status === "Not Responded"
                          ? "border-yellow-500 bg-yellow-600/20 text-yellow-400"
                          : job.status === "Applied"
                          ? "border-blue-500 bg-blue-600/20 text-blue-400"
                          : "border-green-500 bg-green-600/20 text-green-400"
                      }`}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option
                          key={opt}
                          value={opt}
                          className="bg-black text-white"
                        >
                          {opt}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-center">
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

    </div>
  );
}
