import { db } from "@/lib/db";

/* PUT: Update Subject */
export async function PUT(req,context) {
  const params = await context.params;
  const { id } = params;
  const body = await req.json();

  await db.query(
    "UPDATE subjects SET name=?, code=?, status=? WHERE id=?",
    [
      body.name,
      body.code,
      body.status || "active",
      id
    ]
  );

  return Response.json({ success: true });
}

/* DELETE: Remove Subject */
export async function DELETE(req, { params }) {
  await db.query("DELETE FROM subjects WHERE id=?", [params.id]);
  return Response.json({ success: true });
}
