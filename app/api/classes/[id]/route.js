import { db } from "@/lib/db";

// GET single class
export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;
  const [rows] = await db.query(
    "SELECT * FROM classes WHERE id=?",
    [id]
  );

  if (!rows.length)
    return Response.json({ error: "Not found" }, { status: 404 });

  return Response.json(rows[0]);
}

// UPDATE class
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;
  const body = await req.json();

  await db.query(
    `UPDATE classes 
     SET name=?, code=?, duration=?, description=?, status=? 
     WHERE id=?`,
    [
      body.name,
      body.code,
      body.duration,
      body.description,
      body.status,
      id,
    ]
  );

  return Response.json({ success: true });
}

// DELETE class
export async function DELETE(req, { params }) {
  await db.query("DELETE FROM classes WHERE id=?", [params.id]);
  return Response.json({ success: true });
}
