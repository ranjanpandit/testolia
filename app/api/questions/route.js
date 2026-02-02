import { db } from "@/lib/db";

function normalize(html = "") {
  return html.replace(/\s+/g, " ").trim();
}

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const subject = searchParams.get("subject") || "";
    const topic = searchParams.get("topic") || "";
    const question_type = searchParams.get("question_type") || "";
    const difficulty = searchParams.get("difficulty") || "";

    const page = Number(searchParams.get("page") || 1);
    const limit = Number(searchParams.get("limit") || 10);
    const offset = (page - 1) * limit;

    let where = `WHERE 1=1`;
    const values = [];

    if (question_type) {
      where += ` AND question_type = ?`;
      values.push(question_type);
    }

    if (difficulty) {
      where += ` AND difficulty = ?`;
      values.push(difficulty);
    }

    if (subject) {
      where += ` AND subject LIKE ?`;
      values.push(`%${subject}%`);
    }

    if (topic) {
      where += ` AND topic LIKE ?`;
      values.push(`%${topic}%`);
    }

    // ✅ total count
    const [[countRow]] = await db.query(
      `SELECT COUNT(*) as total FROM questions ${where}`,
      values
    );

    // ✅ paginated data
    const [rows] = await db.query(
      `SELECT * FROM questions
       ${where}
       ORDER BY id DESC
       LIMIT ? OFFSET ?`,
      [...values, limit, offset]
    );

    return Response.json({
      data: rows,
      total: countRow.total,
      page,
      limit,
    });
  } catch (err) {
    console.error("GET /api/questions error:", err);
    return Response.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}


export async function POST(req) {
  try {
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
      fill_answers = [],
      integer_answer,
    } = data;

    if (!question_type || !question_text) {
      return Response.json(
        { message: "question_type and question_text are required" },
        { status: 400 }
      );
    }

    const normalizedQ = normalize(question_text);

    // ✅ Duplicate check
    const [dup] = await db.query(
      `SELECT id FROM questions 
       WHERE question_type = ? AND TRIM(question_text) = TRIM(?) 
       LIMIT 1`,
      [question_type, normalizedQ]
    );

    if (dup.length > 0) {
      return Response.json(
        {
          message: `Duplicate question detected (ID: ${dup[0].id})`,
          duplicate_id: dup[0].id,
        },
        { status: 409 }
      );
    }

    // ✅ START TRANSACTION (works if your db supports it)
    await db.query("START TRANSACTION");

    // ✅ Insert question
    const [qRes] = await db.query(
      `INSERT INTO questions
        (question_type, question_text, question_image, difficulty, marks, negative_marks, subject, topic, explanation, explanation_image)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        question_type,
        normalizedQ,
        question_image || null,
        difficulty || "medium",
        marks ?? 1,
        negative_marks ?? 0,
        subject || null,
        topic || null,
        explanation || null,
        explanation_image || null,
      ]
    );

    const question_id = qRes.insertId;

    // ✅ SCQ/MCQ Options
    if (question_type === "scq" || question_type === "mcq") {
      if (!Array.isArray(options) || options.length < 2) {
        throw new Error("At least 2 options required");
      }

      for (const opt of options) {
        await db.query(
          `INSERT INTO question_options (question_id, option_text, option_image, is_correct)
           VALUES (?, ?, ?, ?)`,
          [
            question_id,
            opt.option_text || null,
            opt.option_image || null,
            opt.is_correct ? 1 : 0,
          ]
        );
      }
    }

    // ✅ Fill blank
    if (question_type === "fill_blank") {
      if (!Array.isArray(fill_answers) || fill_answers.length === 0) {
        throw new Error("Fill blank answers required");
      }

      for (let i = 0; i < fill_answers.length; i++) {
        await db.query(
          `INSERT INTO question_fill_answers (question_id, answer_text, answer_order)
           VALUES (?, ?, ?)`,
          [question_id, fill_answers[i], i + 1]
        );
      }
    }

    // ✅ Integer
    if (question_type === "integer") {
      if (
        integer_answer === undefined ||
        integer_answer === null ||
        integer_answer === ""
      ) {
        throw new Error("Integer answer required");
      }

      await db.query(
        `INSERT INTO question_integer_answers (question_id, answer_value)
         VALUES (?, ?)`,
        [question_id, integer_answer]
      );
    }

    // ✅ COMMIT
    await db.query("COMMIT");

    return Response.json({
      success: true,
      question_id,
    });
  } catch (err) {
    // ✅ ROLLBACK (important)
    try {
      await db.query("ROLLBACK");
    } catch (e) {}

    console.error("POST /api/questions error:", err);
    return Response.json(
      { message: err.message || "Internal server error" },
      { status: 500 }
    );
  }
}

