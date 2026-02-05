import { db } from "@/lib/db";

/* =========================
   GET TEST
========================= */
export async function GET(req, { params }) {
  const { id } = await params;

  const [rows] = await db.query(`SELECT * FROM exams WHERE id = ?`, [id]);

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
    ],
  );

  return Response.json({ success: true });
}

/* =========================
   DELETE TEST
========================= */
export async function DELETE(req, { params }) {
  const { id } = await params;

  // Optional safety: prevent deleting published tests
  const [[test]] = await db.query(`SELECT status FROM exams WHERE id = ?`, [
    id,
  ]);

  if (!test) {
    return Response.json({ message: "Test not found" }, { status: 404 });
  }

  if (test.status === "published") {
    return Response.json(
      { message: "Cannot delete a published test" },
      { status: 400 },
    );
  }

  await db.query(`DELETE FROM exams WHERE id = ?`, [id]);

  return Response.json({ success: true });
}

export async function PATCH(req, { params }) {
  try {
    const { id } = await params;
    const { status } = await req.json();

    // 1. Basic Validation
    const validStatuses = ["draft", "published", "archived"];
    if (!validStatuses.includes(status)) {
      return Response.json(
        { message: "Invalid status value" },
        { status: 400 },
      );
    }

    // 2. Business Logic Validation (Publishing Integrity)
    if (status === "published") {
      const [validationRows] = await db.query(
        ` select e.total_questions,section_id,count(esq.question_id) as mapped_question from
         exams e LEFT JOIN exam_pattern_sections eps on e.id=eps.exam_pattern_id
          LEFT JOIN exam_section_questions esq ON eps.id=esq.section_id
           where e.id= ? group by section_id`,
        [id],
      );
      const audit = validationRows[0];
      const totalMappedQuestions = validationRows.reduce(
        (sum, item) => sum + item.mapped_question,
        0,
      );

      if (!audit) {
        return Response.json(
          { message: "Test record not found" },
          { status: 404 },
        );
      }

      const required  = Number(audit.total_questions || 0);
      const actual = Number(totalMappedQuestions || 0);
//console.log({required,actual,validationRows})
      // Prevent publishing if the blueprint is incomplete
      if (actual < required || required === 0) {
        return Response.json(
          {
            message: `Publishing Denied: Assessment requires ${required} questions, but only ${actual} are assigned.`,
          },
          { status: 404 },
        );
      }
    }

    // 3. Update Registry
    await db.query(`UPDATE exams SET status = ? WHERE id = ?`, [status, id]);

    return Response.json({
      success: true,
      newStatus: status,
      message: `Blueprint status updated to ${status.toUpperCase()}`,
    });
  } catch (err) {
    console.error("PATCH_STATUS_ERROR:", err);
    return Response.json(
      { message: "Internal System Error: Status update failed" },
      { status: 500 },
    );
  }
}
