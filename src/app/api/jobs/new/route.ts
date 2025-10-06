import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const client = await clientPromise;
  const db = client.db("jobtracker");
  const body = await req.json();

  const newJob = {
    company: body.company,
    position: body.position,
    appliedAt: new Date(),
    status: "Applied",
  };

  await db.collection("jobs").insertOne(newJob);
  return NextResponse.json({ message: "Job added successfully!" });
}
