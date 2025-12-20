import { db } from "@/lib/db";

export async function POST(req) {
  const body = await req.json();

  const [q] = await db.query(
    `INSERT INTO questions 
     (subject_id, topic_id, type, difficulty, marks, question_html)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      body.subjectId,
      body.topicId,
      body.type,
      body.difficulty,
      body.marks,
      body.question,
    ]
  );

  const questionId = q.insertId;

  for (let i = 0; i < body.options.length; i++) {
    const opt = body.options[i];
    await db.query(
      `INSERT INTO question_options 
       (question_id, option_html, is_correct, sort_order)
       VALUES (?, ?, ?, ?)`,
      [questionId, opt.text, opt.correct ? 1 : 0, i + 1]
    );
  }

  return Response.json({ success: true });
}
