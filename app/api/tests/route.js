import { db } from "@/lib/db";

export async function GET() {
  try {
    const [rows] = await db.query(
      `SELECT id, title, duration_minutes, status, start_time, end_time
       FROM exams
       ORDER BY id DESC`
    );

    return Response.json(rows);
  } catch (err) {
    console.error("GET /api/tests error:", err);
    return Response.json(
      { message: "Failed to load tests" },
      { status: 500 }
    );
  }
}

export async function POST(req) {
  try {
    const data = await req.json();

    const {
      title,
      description,
      duration_minutes,
      total_questions,
      total_marks,
      start_time,
      end_time,
      status,
    } = data;

    if (!title || !duration_minutes) {
      return Response.json(
        { message: "Title and duration are required" },
        { status: 400 }
      );
    }

    const [result] = await db.query(
      `INSERT INTO exams
       (title, description, duration_minutes,total_questions,total_marks, start_time, end_time, status)
       VALUES (?, ?, ?, ?, ?, ?,?,?)`,
      [
        title,
        description || null,
        duration_minutes,
        total_questions,
        total_marks,
        start_time || null,
        end_time || null,
        status || "draft",
      ]
    );

    return Response.json({
      success: true,
      exam_id: result.insertId,
    });
  } catch (err) {
    console.error("POST /api/tests error:", err);
    return Response.json(
      { message: err.message || "Failed to create test" },
      { status: 500 }
    );
  }
}
