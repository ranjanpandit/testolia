import { db } from "@/lib/db";

/* GET: List Subjects */
export async function GET() {
  const [rows] = await db.query(
    "SELECT * FROM subjects ORDER BY createdAt DESC"
  );
  return Response.json(rows);
}

/* POST: Create Subject */
export async function POST(req) {
  const body = await req.json();
  const { name, code } = body;

  if (!name) {
    return Response.json({ error: "Name required" }, { status: 400 });
  }

  const [result] = await db.query(
    "INSERT INTO subjects (name, code) VALUES (?, ?)",
    [name, code || null]
  );

  return Response.json({ id: result.insertId });
}
