import { ObjectId } from "mongodb";
import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";

export async function GET(_: Request, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db("jobtracker");
  const job = await db
    .collection("jobs")
    .findOne({ _id: new ObjectId(params.id) });
  return NextResponse.json(job);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
  const client = await clientPromise;
  const db = client.db("jobtracker");
  await db.collection("jobs").deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ message: "Deleted" });
}
