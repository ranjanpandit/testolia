import { db } from "@/lib/db";

/* LIST PATTERNS */
export async function GET() {
  const [rows] = await db.query(
    "SELECT * FROM exam_patterns ORDER BY createdAt DESC"
  );
  return Response.json(rows);
}

/* CREATE PATTERN */
export async function POST(req) {
  const body = await req.json();
  const { name, description, durationMinutes } = body;

  if (!name || !durationMinutes) {
    return Response.json({ error: "Name & duration required" }, { status: 400 });
  }

  const [result] = await db.query(
    "INSERT INTO exam_patterns (name, description, duration_minutes) VALUES (?, ?, ?)",
    [name, description || null, durationMinutes]
  );

  return Response.json({ id: result.insertId });
}
