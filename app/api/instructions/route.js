import { db } from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT * FROM exam_instructions ORDER BY id DESC");
  return Response.json(rows);
}

export async function POST(req) {
  const { title, content } = await req.json();
  await db.query(
    "INSERT INTO exam_instructions (title, content) VALUES (?, ?)",
    [title, content]
  );
  return Response.json({ success: true });
}
