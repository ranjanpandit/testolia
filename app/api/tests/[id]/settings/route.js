import { db } from "@/lib/db";

export async function GET(req, { params }) {
  try {
    const {id} = await params       
    const examId = id;

    const [rows] = await db.query(
      `SELECT * FROM exam_patterns WHERE exam_id = ?`,
      [examId]
    );

    return Response.json(rows[0] || null);
  } catch (err) {
    console.error("GET test settings error:", err);
    return Response.json(
      { message: "Failed to load test settings" },
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
      shuffle_questions,
      shuffle_options,
      allow_section_switch,
      allow_review,
      negative_marking,
      show_result_after_submit,
      instructions,
    } = data;

    // ✅ UPSERT pattern
    await db.query(
      `
      INSERT INTO exam_patterns
      (exam_id, shuffle_questions, shuffle_options, allow_section_switch, allow_review,
       negative_marking, show_result_after_submit, instructions)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      ON DUPLICATE KEY UPDATE
        shuffle_questions = VALUES(shuffle_questions),
        shuffle_options = VALUES(shuffle_options),
        allow_section_switch = VALUES(allow_section_switch),
        allow_review = VALUES(allow_review),
        negative_marking = VALUES(negative_marking),
        show_result_after_submit = VALUES(show_result_after_submit),
        instructions = VALUES(instructions)
      `,
      [
        examId,
        shuffle_questions ? 1 : 0,
        shuffle_options ? 1 : 0,
        allow_section_switch ? 1 : 0,
        allow_review ? 1 : 0,
        negative_marking ? 1 : 0,
        show_result_after_submit ? 1 : 0,
        instructions || null,
      ]
    );

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST test settings error:", err);
    return Response.json(
      { message: err.message || "Failed to save test settings" },
      { status: 500 }
    );
  }
}
