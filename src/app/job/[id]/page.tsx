"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Edit3,
  Save,
  X,
  Briefcase,
  MapPin,
  FileText,
  ListChecks,
} from "lucide-react";

type Job = {
  _id: string;
  company: string;
  position: string;
  type: string;
  city: string;
  description?: string;
  qualifications?: string[];
  appliedAt: string;
  status: string;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    company: "",
    position: "",
    type: "",
    city: "",
    description: "",
    qualifications: "",
  });

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        setJob(data);
        setFormData({
          company: data.company || "",
          position: data.position || "",
          type: data.type || "",
          city: data.city || "",
          description: data.description || "",
          qualifications: (data.qualifications || []).join(", "),
        });
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          qualifications: formData.qualifications
            .split(",")
            .map((q) => q.trim()),
        }),
      });
      const updated = await res.json();
      setJob(updated);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen bg-[#111] text-gray-400 flex items-center justify-center text-2xl">
        Loading job details...
      </div>
    );

  if (!job)
    return (
      <div className="min-h-screen bg-[#111] text-gray-400 flex items-center justify-center text-2xl">
        Job not found
      </div>
    );

  return (
    <div className="min-h-screen bg-[#111] text-white font-mono p-10">
      <a
        href="/"
        className="text-yellow-400 flex items-center gap-2 hover:text-pink-500 mb-6"
      >
        <ArrowLeft size={20} /> Back to Jobs
      </a>

      <h1 className="text-5xl font-extrabold text-yellow-400 mb-2 flex items-center gap-2">
        <Briefcase size={36} />
        {job.position}
      </h1>
      <h2 className="text-3xl text-pink-400 mb-2">{job.company}</h2>

      <p className="text-gray-400 mb-8 flex flex-col sm:flex-row sm:items-center sm:gap-4">
        <span className="flex items-center gap-2">
          <MapPin size={18} /> {job.city}
        </span>
        <span className="flex items-center gap-2">
          <FileText size={18} /> {job.type}
        </span>
        <span>
          Applied: {new Date(job.appliedAt).toLocaleDateString()} |{" "}
          <span className="font-bold text-yellow-300">{job.status}</span>
        </span>
      </p>

      {!isEditing ? (
        <>
          <section className="border-2 border-yellow-400 rounded-xl p-6 mb-8 bg-black/60">
            <h3 className="text-2xl font-bold text-yellow-400 mb-3 flex items-center gap-2">
              <FileText size={24} /> Job Description
            </h3>
            <p className="text-gray-300 leading-relaxed">
              {job.description || "No description provided."}
            </p>
          </section>

          <section className="border-2 border-pink-500 rounded-xl p-6 mb-8 bg-black/60">
            <h3 className="text-2xl font-bold text-pink-400 mb-3 flex items-center gap-2">
              <ListChecks size={24} /> Qualifications
            </h3>
            {job.qualifications?.length ? (
              <ul className="list-disc pl-6 text-gray-300">
                {job.qualifications.map((q, i) => (
                  <li key={i}>{q}</li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-400">No qualifications listed.</p>
            )}
          </section>

          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center justify-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg border-2 border-black hover:bg-pink-500 hover:text-white transition-all"
          >
            <Edit3 size={20} /> Edit Data
          </button>
        </>
      ) : (
        <div className="bg-black/60 p-6 border-2 border-yellow-400 rounded-xl space-y-4">
          <h3 className="text-2xl text-yellow-400 font-bold mb-4">
            Edit Job Data
          </h3>

          <input
            name="company"
            value={formData.company}
            onChange={handleChange}
            placeholder="Company"
            className="w-full p-3 rounded-lg bg-black border-2 border-pink-500 text-white"
          />
          <input
            name="position"
            value={formData.position}
            onChange={handleChange}
            placeholder="Position"
            className="w-full p-3 rounded-lg bg-black border-2 border-yellow-400 text-white"
          />

          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-black border-2 border-pink-500 text-white"
          >
            <option value="">Select Job Type</option>
            <option value="Full-time">Full-time</option>
            <option value="Internship">Internship</option>
            <option value="Contract">Contract</option>
            <option value="Freelance">Freelance</option>
            <option value="Side Job">Side Job</option>
          </select>

          <input
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="City"
            className="w-full p-3 rounded-lg bg-black border-2 border-yellow-400 text-white"
          />

          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Job Description"
            className="w-full p-3 rounded-lg bg-black border-2 border-pink-500 text-white h-28"
          />

          <textarea
            name="qualifications"
            value={formData.qualifications}
            onChange={handleChange}
            placeholder="Qualifications (comma separated)"
            className="w-full p-3 rounded-lg bg-black border-2 border-yellow-400 text-white h-28"
          />

          <div className="flex gap-4 mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-2 bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg border-2 border-black hover:bg-pink-500 hover:text-white transition-all"
            >
              <Save size={18} /> Save Changes
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="flex items-center gap-2 bg-gray-600 text-white font-bold px-6 py-3 rounded-lg border-2 border-black hover:bg-red-600 transition-all"
            >
              <X size={18} /> Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
