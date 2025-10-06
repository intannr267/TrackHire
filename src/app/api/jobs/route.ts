import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET() {
  const client = await clientPromise;
  const db = client.db("jobtracker");
  const jobs = await db.collection("jobs").find({}).toArray();

  // Auto update status
  const now = new Date();
  const updatedJobs = jobs.map((job) => {
    const daysPassed = Math.floor(
      (now.getTime() - new Date(job.appliedAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    if (job.status === "Applied" && daysPassed > 30) job.status = "Rejected";
    else if (job.status === "Applied" && daysPassed > 14)
      job.status = "Not Responded";
    return job;
  });

  return NextResponse.json(updatedJobs);
}

export async function POST(req: Request) {
  const { company, position, detail, applyVia } = await req.json();
  const client = await clientPromise;
  const db = client.db("jobtracker");
  const result = await db.collection("jobs").insertOne({
    company,
    position,
    detail,
    applyVia,
    appliedAt: new Date(),
    status: "Applied",
  });
  return NextResponse.json({ message: "Added", id: result.insertedId });
}
