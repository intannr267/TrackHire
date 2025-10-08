import clientPromise from "@/lib/mongodb";
import { NextResponse } from "next/server";
import { verifyToken } from "@/lib/jwt"; // pastikan file ini sudah ada

export async function POST(req: Request) {
  try {
    const token = req.headers.get("authorization")?.split(" ")[1];
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token) as { userId: string; email: string };

    const { company, position } = await req.json();
    if (!company || !position) {
      return NextResponse.json({ error: "Company and Position are required" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("jobtracker");

    const newJob = {
      userId: decoded.userId, // <--- tambahkan userId agar data user terpisah
      company,
      position,
      appliedAt: new Date(),
      status: "Applied",
    };

    await db.collection("jobs").insertOne(newJob);

    return NextResponse.json({ message: "Job added successfully!" });
  } catch (error) {
    console.error("Error adding job:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
