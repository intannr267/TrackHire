import jwt, { JwtPayload } from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET!;

export function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, SECRET, { expiresIn: "7d" });
}

export function verifyToken(token: string): JwtPayload & { userId: string; email: string } {
  return jwt.verify(token, SECRET) as JwtPayload & { userId: string; email: string };
}
