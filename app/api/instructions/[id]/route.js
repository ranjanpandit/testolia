import { db } from "@/lib/db";

export async function GET(req, { params }) {
  const { id } =await params;
  const [[row]] = await db.query("SELECT * FROM exam_instructions WHERE id = ?", [id]);
  return Response.json(row);
}

export async function PUT(req, { params }) {
  const { id } =await params;
  const { title, content } = await req.json();

  await db.query(
    "UPDATE exam_instructions SET title = ?, content = ? WHERE id = ?",
    [title, content, id]
  );

  return Response.json({ success: true });
}

export async function DELETE(req, { params }) {
  const { id } =await params;
  await db.query("DELETE FROM exam_instructions WHERE id = ?", [id]);
  return Response.json({ success: true });
}
