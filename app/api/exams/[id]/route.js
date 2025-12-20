import { db } from "@/lib/db";

/* GET SINGLE */
export async function GET(req, context) {
  const params = await context.params;
  const [rows] = await db.query("SELECT * FROM exams WHERE id=?", [params.id]);
  return Response.json(rows[0]);
}

/* UPDATE / PUBLISH */
export async function PUT(req, context) {
  const params = await context.params;
  const body = await req.json();

  await db.query(
    `UPDATE exams SET 
      title=?, description=?, start_at=?, end_at=?, status=?
     WHERE id=?`,
    [
      body.name,
      body.description,
      body.startAt,
      body.endAt,
      body.status,
      params.id,
    ]
  );

  return Response.json({ success: true });
}

/* DELETE */
export async function DELETE(req, context) {
  const params = await context.params;
  await db.query("DELETE FROM exams WHERE id=?", [params.id]);
  return Response.json({ success: true });
}
