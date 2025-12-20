import { db } from "@/lib/db";

/* GET SINGLE PATTERN */
export async function GET(req,context) {
  const params = await context.params;
  const [pattern] = await db.query(
    "SELECT * FROM exam_patterns WHERE id=?",
    [params.id]
  );

  const [sections] = await db.query(
    "SELECT * FROM exam_pattern_sections WHERE pattern_id=?",
    [params.id]
  );

  return Response.json({
    pattern: pattern[0],
    sections
  });
}

/* UPDATE PATTERN */
export async function PUT(req, context) {
  const params = await context.params;
  const body = await req.json();

  await db.query(
    "UPDATE exam_patterns SET name=?, description=?, duration=?, status=? WHERE id=?",
    [
      body.name,
      body.description,
      body.duration,
      body.status,
      params.id
    ]
  );

  return Response.json({ success: true });
}

/* DELETE */
export async function DELETE(req, context) {
  const params = await context.params;
  await db.query("DELETE FROM exam_patterns WHERE id=?", [params.id]);
  return Response.json({ success: true });
}
