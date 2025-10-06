import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";

export async function PATCH(req: Request) {
  const client = await clientPromise;
  const db = client.db("jobtracker");
  const body = await req.json();

  await db.collection("jobs").updateOne(
    { _id: new ObjectId(body.id) },
    { $set: { status: body.status } }
  );

  return NextResponse.json({ message: "Status updated" });
}
