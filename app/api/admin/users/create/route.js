import { db } from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req) {
  const { name, email, password, role_id } = await req.json();

  const hash = bcrypt.hashSync(password, 10);

  await db.query(
    `INSERT INTO users (name, email, password, role_id)
     VALUES (?, ?, ?, ?)`,
    [name, email, hash, role_id]
  );

  return Response.json({ success: true });
}

