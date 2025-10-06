"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

type Job = {
  _id: string;
  company: string;
  position: string;
  description?: string;
  qualifications?: string[];
  appliedAt: string;
  status: string;
};

export default function JobDetailPage() {
  const { id } = useParams();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchJob() {
      try {
        const res = await fetch(`/api/jobs/${id}`);
        const data = await res.json();
        setJob(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchJob();
  }, [id]);

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
        className="text-yellow-400 underline hover:text-pink-500 mb-6 inline-block"
      >
        ← Back to Jobs
      </a>

      <h1 className="text-5xl font-extrabold text-yellow-400 mb-4">
        {job.position}
      </h1>
      <h2 className="text-3xl text-pink-400 mb-2">{job.company}</h2>

      <p className="text-gray-400 mb-8">
        Applied on: {new Date(job.appliedAt).toLocaleDateString()} | Status:{" "}
        <span className="font-bold text-yellow-300">{job.status}</span>
      </p>

      <section className="border-2 border-yellow-400 rounded-xl p-6 mb-8 bg-black/60">
        <h3 className="text-2xl font-bold text-yellow-400 mb-3">
          Job Description
        </h3>
        <p className="text-gray-300">
          {job.description ||
            "No job description provided. You can update it later."}
        </p>
      </section>
      <section className="border-2 border-pink-500 rounded-xl p-6 mb-8 bg-black/60">
        <h3 className="text-2xl font-bold text-pink-400 mb-3">
          Qualifications
        </h3>
        {job.qualifications && job.qualifications.length > 0 ? (
          <ul className="list-disc pl-6 text-gray-300">
            {job.qualifications.map((q, i) => (
              <li key={i}>{q}</li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-400">No qualifications listed.</p>
        )}
      </section>

      <section className="border-2 border-yellow-500 rounded-xl p-6 flex flex-col items-center bg-black/60">
        <h3 className="text-2xl font-bold text-yellow-400 mb-4">
          Upload Your CV (for checking your score)
        </h3>
        <input
          type="file"
          accept=".pdf"
          className="bg-black border-4 border-pink-500 px-4 py-2 rounded-lg mb-4 text-gray-300"
          disabled
        />
        <button
          disabled
          className="bg-yellow-400 text-black font-bold px-6 py-3 rounded-lg border-2 border-black opacity-50 cursor-not-allowed"
        >
          Upload & Score CV
        </button>
      </section>
    </div>
  );
}
