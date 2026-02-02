import { db } from "@/lib/db";

/* =========================
   GET: Section Questions
========================= */
export async function GET(req, { params }) {
  try {
    const { sectionId } =await params;

    const [rows] = await db.query(
      `SELECT q.id, q.question_text, q.question_type, q.subject, q.topic
       FROM exam_section_questions sq
       JOIN questions q ON q.id = sq.question_id
       WHERE sq.section_id = ?
       ORDER BY sq.id DESC`,
      [sectionId]
    );

    return Response.json(rows);
  } catch (err) {
    console.error("GET section questions error:", err);
    return Response.json(
      { message: "Failed to load section questions" },
      { status: 500 }
    );
  }
}

/* =========================
   POST: Add Questions (LIMIT SAFE)
========================= */
/* =========================
   POST: Add Questions (LIMIT SAFE)
========================= */
export async function POST(req, { params }) {
  const conn = await db.getConnection();

  try {
    const { sectionId } = await params;
    const { question_ids = [] } = await req.json();

    if (!Array.isArray(question_ids) || question_ids.length === 0) {
      return Response.json({ message: "No questions selected" }, { status: 400 });
    }

    await conn.beginTransaction();

    // 1️⃣ LOCK the section row for update to prevent simultaneous requests from exceeding limits
    const [[section]] = await conn.query(
      `SELECT total_questions FROM exam_pattern_sections WHERE id = ? FOR UPDATE`,
      [sectionId]
    );

    if (!section) {
      await conn.rollback();
      return Response.json({ message: "Section not found" }, { status: 404 });
    }

    // 2️⃣ Count current questions in this section
    const [[countRow]] = await conn.query(
      `SELECT COUNT(*) AS count FROM exam_section_questions WHERE section_id = ?`,
      [sectionId]
    );

    const existingCount = countRow.count;
    const incomingCount = question_ids.length;

    // 3️⃣ STRICT LIMIT CHECK: Does current + new exceed the blueprint?
    if (existingCount + incomingCount > section.total_questions) {
      await conn.rollback();
      return Response.json(
        {
          message: `Cannot add ${incomingCount} questions. Section only has ${section.total_questions - existingCount} slots remaining.`,
        },
        { status: 409 }
      );
    }

    // 4️⃣ Bulk Insert
    const values = question_ids.map(qid => [sectionId, qid]);
    await conn.query(
      `INSERT IGNORE INTO exam_section_questions (section_id, question_id) VALUES ?`,
      [values]
    );

    await conn.commit();

    return Response.json({
      success: true,
      added: incomingCount,
      total_now: existingCount + incomingCount,
    });
  } catch (err) {
    await conn.rollback();
    return Response.json({ message: err.message || "Operation failed" }, { status: 500 });
  } finally {
    conn.release();
  }
}

/* =========================
   DELETE: Remove Question
========================= */
export async function DELETE(req, { params }) {
  try {
    const { sectionId } = await params;
    const { question_id } = await req.json();

    if (!question_id) {
      return Response.json({ message: "Invalid question ID" }, { status: 400 });
    }

    // Removing the association between section and question
    await db.query(
      `DELETE FROM exam_section_questions
       WHERE section_id = ? AND question_id = ?`,
      [sectionId, question_id]
    );

    return Response.json({ 
      success: true,
      message: "Item removed from blueprint" 
    });
  } catch (err) {
    console.error("DELETE section question error:", err);
    return Response.json(
      { message: "Failed to remove question" },
      { status: 500 }
    );
  }
}
