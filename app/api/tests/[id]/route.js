import { db } from "@/lib/db";

/* =========================
   GET TEST
========================= */
export async function GET(req, { params }) {
  const { id } = await params;

  const [rows] = await db.query(
    `SELECT * FROM exams WHERE id = ?`,
    [id]
  );

  return Response.json(rows[0] || null);
}

/* =========================
   UPDATE TEST
========================= */
export async function PUT(req, { params }) {
  const data = await req.json();
  const { id } = await params;

  await db.query(
    `UPDATE exams SET
      title = ?,
      description = ?,
      duration_minutes = ?,
      total_questions = ?,
      total_marks = ?,
      start_time = ?,
      end_time = ?,
      status = ?
     WHERE id = ?`,
    [
      data.title,
      data.description,
      data.duration_minutes,
      data.total_questions,
      data.total_marks,
      data.start_time || null,
      data.end_time || null,
      data.status,
      id,
    ]
  );

  return Response.json({ success: true });
}

/* =========================
   DELETE TEST
========================= */
export async function DELETE(req, { params }) {
  const { id } = await params;

  // Optional safety: prevent deleting published tests
  const [[test]] = await db.query(
    `SELECT status FROM exams WHERE id = ?`,
    [id]
  );

  if (!test) {
    return Response.json(
      { message: "Test not found" },
      { status: 404 }
    );
  }

  if (test.status === "published") {
    return Response.json(
      { message: "Cannot delete a published test" },
      { status: 400 }
    );
  }

  await db.query(`DELETE FROM exams WHERE id = ?`, [id]);

  return Response.json({ success: true });
}
