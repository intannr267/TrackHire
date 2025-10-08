import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { ObjectId } from "mongodb";

export async function GET(req: Request, { params }: { params: { id: string } }) {
  try {
    const client = await clientPromise;
    const db = client.db("jobtracker");

    const job = await db.collection("jobs").findOne({
      _id: new ObjectId(params.id),
    });

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (err) {
    console.error("Error fetching job:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
