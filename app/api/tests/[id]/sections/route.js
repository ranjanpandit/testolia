import { db } from "@/lib/db";

async function getPatternId(examId) {
  const [rows] = await db.query(
    `SELECT id FROM exam_patterns WHERE exam_id = ?`,
    [examId]
  );
  return rows[0]?.id || null;
}

export async function GET(req, { params }) {
  try {
    const {id} = await params      
    const examId = id;
    const patternId = await getPatternId(examId);

    if (!patternId) return Response.json([]);

    const [rows] = await db.query(
      `SELECT * FROM exam_pattern_sections
       WHERE exam_pattern_id = ?
       ORDER BY id ASC`,
      [patternId]
    );

    return Response.json(rows);
  } catch (err) {
    console.error("GET sections error:", err);
    return Response.json(
      { message: "Failed to load sections" },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const {id} = await params      
    const examId = id;
    const data = await req.json();

    const {
      section_name,
      total_questions,
      marks_per_question,
      negative_marks,
      duration_minutes,
      randomize,
    } = data;

    if (!section_name || !total_questions) {
      return Response.json(
        { message: "Section name & total questions required" },
        { status: 400 }
      );
    }

    let patternId = await getPatternId(examId);

    // ✅ auto-create pattern if missing
    if (!patternId) {
      const [res] = await db.query(
        `INSERT INTO exam_patterns (exam_id) VALUES (?)`,
        [examId]
      );
      patternId = res.insertId;
    }

    await db.query(
      `INSERT INTO exam_pattern_sections
       (exam_pattern_id, section_name, total_questions,
        marks_per_question, negative_marks, duration_minutes, randomize)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        patternId,
        section_name,
        total_questions,
        marks_per_question ?? 1,
        negative_marks ?? 0,
        duration_minutes || null,
        randomize ? 1 : 0,
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST section error:", err);
    return Response.json(
      { message: err.message || "Failed to add section" },
      { status: 500 }
    );
  }
}

