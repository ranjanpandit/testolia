import { db } from "@/lib/db";

export async function GET(req, { params }) {
  const { id } = await params;

  const [qRows] = await db.query(`SELECT * FROM questions WHERE id = ?`, [id]);
  if (qRows.length === 0) {
    return Response.json({ message: "Question not found" }, { status: 404 });
  }

  const question = qRows[0];

  // Options
  const [options] = await db.query(
    `SELECT id, option_text, option_image, is_correct
     FROM question_options
     WHERE question_id = ?
     ORDER BY id ASC`,
    [id]
  );

  // Fill answers
  const [fillAnswers] = await db.query(
    `SELECT id, answer_text, answer_order
     FROM question_fill_answers
     WHERE question_id = ?
     ORDER BY answer_order ASC`,
    [id]
  );

  // Integer answer
  const [integerAnswer] = await db.query(
    `SELECT id, answer_value, min_value, max_value
     FROM question_integer_answers
     WHERE question_id = ?
     LIMIT 1`,
    [id]
  );

  return Response.json({
    question,
    options,
    fillAnswers,
    integerAnswer: integerAnswer?.[0] || null,
  });
}

function normalize(html = "") {
  return html.replace(/\s+/g, " ").trim();
}

export async function PUT(req, { params }) {
  try {
    const {id} = await params;
    const data = await req.json();

    const {
      question_type,
      question_text,
      question_image,
      difficulty,
      marks,
      negative_marks,
      subject,
      topic,
      explanation,
      explanation_image,
      options = [],
    } = data;

    if (!question_type || !question_text) {
      return Response.json(
        { message: "question_type and question_text are required" },
        { status: 400 }
      );
    }

    // ✅ start transaction (same pattern as your POST fix)
    await db.query("START TRANSACTION");

    // ✅ update question
    await db.query(
      `UPDATE questions SET
        question_type = ?,
        question_text = ?,
        question_image = ?,
        difficulty = ?,
        marks = ?,
        negative_marks = ?,
        subject = ?,
        topic = ?,
        explanation = ?,
        explanation_image = ?
       WHERE id = ?`,
      [
        question_type,
        normalize(question_text),
        question_image || null,
        difficulty || "medium",
        marks ?? 1,
        negative_marks ?? 0,
        subject || null,
        topic || null,
        explanation || null,
        explanation_image || null,
        id,
      ]
    );

    // ✅ Replace options (SCQ/MCQ)
    await db.query(`DELETE FROM question_options WHERE question_id = ?`, [id]);

    if (question_type === "scq" || question_type === "mcq") {
      if (!Array.isArray(options) || options.length < 2) {
        throw new Error("At least 2 options required");
      }

      for (const opt of options) {
        await db.query(
          `INSERT INTO question_options (question_id, option_text, option_image, is_correct)
           VALUES (?, ?, ?, ?)`,
          [id, opt.option_text || null, opt.option_image || null, opt.is_correct ? 1 : 0]
        );
      }
    }

    await db.query("COMMIT");

    return Response.json({ success: true, id });
  } catch (err) {
    try {
      await db.query("ROLLBACK");
    } catch (e) {}

    console.error("PUT /api/questions/[id] error:", err);
    return Response.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

