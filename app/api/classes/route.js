import { db } from "@/lib/db";

// GET all classes
export async function GET() {
  const [rows] = await db.query(
    "SELECT * FROM classes ORDER BY createdAt DESC"
  );
  return Response.json(rows);
}

// CREATE class
export async function POST(req) {
  const body = await req.json();
  const { name, code, duration, description, status } = body;

  await db.query(
    `INSERT INTO classes (name, code, duration, description, status)
     VALUES (?, ?, ?, ?, ?)`,
    [name, code, duration, description, status || "active"]
  );

  return Response.json({ success: true });
}
