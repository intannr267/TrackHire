import { NextResponse } from "next/server";
import clientPromise from "@/lib/mongodb";
import { signToken } from "@/lib/jwt";

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const client = await clientPromise;
  const db = client.db("jobtracker");

  let user = await db.collection("users").findOne({ email });

  if (!user) {
    const newUser = {
      email,
      password,
      name: email.split("@")[0],
      createdAt: new Date(),
    };
    const result = await db.collection("users").insertOne(newUser);
    user = { ...newUser, _id: result.insertedId };
  } else if (user.password !== password) {
    return NextResponse.json({ error: "Wrong password" }, { status: 401 });
  }

  const token = signToken({ userId: user._id.toString(), email: user.email });
  return NextResponse.json({ token, name: user.name });
}
