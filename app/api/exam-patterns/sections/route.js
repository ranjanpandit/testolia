import { db } from "@/lib/db";

/* ADD SECTION */
export async function POST(req) {
  const body = await req.json();

  const {
    patternId,
    title,
    totalQuestions,
    marksPerQuestion,
    negativeMarks,
    sectionDuration
  } = body;

  await db.query(
    `INSERT INTO exam_pattern_sections 
     (pattern_id, title, total_questions, marks_per_question, negative_marks, section_duration)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      patternId,
      title,
      totalQuestions,
      marksPerQuestion,
      negativeMarks || 0,
      sectionDuration || null
    ]
  );

  return Response.json({ success: true });
}
