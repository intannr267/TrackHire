import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { verifyToken } from "@/lib/jwt";

export async function GET(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 403 }
      );
    }

    const client = await clientPromise;
    const db = client.db("jobtracker");

    const jobs = await db
      .collection("jobs")
      .find({ userId: decoded.userId })
      .toArray();

    const now = new Date();
    const updatedJobs = jobs.map((job) => {
      const daysPassed = Math.floor(
        (now.getTime() - new Date(job.appliedAt).getTime()) /
          (1000 * 60 * 60 * 24)
      );

      if (job.status === "Applied" && daysPassed > 30) {
        job.status = "Rejected";
      } else if (job.status === "Applied" && daysPassed > 14) {
        job.status = "Not Responded";
      }
      return job;
    });

    return NextResponse.json(updatedJobs);
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Invalid or expired token" },
      { status: 403 }
    );
  }
}

// ✅ POST tambah job baru
export async function POST(req: Request) {
  const authHeader = req.headers.get("authorization");
  if (!authHeader)
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  try {
    const token = authHeader.split(" ")[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { company, position, detail, applyVia } = body;

    // validasi sederhana
    if (!company || !position) {
      return NextResponse.json(
        { error: "Company and position are required" },
        { status: 400 }
      );
    }

    const client = await clientPromise;
    const db = client.db("jobtracker");

    const newJob = {
      userId: decoded.userId,
      company,
      position,
      detail: detail || "",
      applyVia: applyVia || "",
      appliedAt: new Date(),
      status: "Applied",
    };

    const result = await db.collection("jobs").insertOne(newJob);

    return NextResponse.json({
      message: "Job added successfully",
      id: result.insertedId,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Invalid token or data" },
      { status: 400 }
    );
  }
}
