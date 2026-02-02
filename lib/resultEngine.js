import { db } from "@/lib/db";

export async function generateResult(attemptId) {
  const [[attempt]] = await db.query(
    `SELECT * FROM exam_attempts WHERE id = ?`,
    [attemptId]
  );
  if (!attempt) throw new Error("Attempt not found");

  const answers = JSON.parse(attempt.answers_json || "{}");

  /* ===== FETCH QUESTIONS + CORRECT OPTIONS ===== */
  const [rows] = await db.query(`
    SELECT 
      q.id AS question_id,
      q.marks,
      q.negative_marks,
      qo.id AS correct_option
    FROM questions q
    JOIN question_options qo 
      ON qo.question_id = q.id AND qo.is_correct = 1
  `);

  const correctMap = {};
  rows.forEach(r => (correctMap[r.question_id] = r));

  let correct = 0;
  let wrong = 0;
  let skipped = 0;
  let obtained = 0;
  let totalMarks = 0;

  Object.values(correctMap).forEach(q => {
    totalMarks += Number(q.marks || 0);
  });

  for (const key in answers) {
    const selectedOption = answers[key];
    const qId = key.split("-")[1];
    const q = correctMap[qId];

    if (!selectedOption) {
      skipped++;
      continue;
    }

    if (selectedOption == q.correct_option) {
      correct++;
      obtained += Number(q.marks || 0);
    } else {
      wrong++;
      obtained -= Number(q.negative_marks || 0);
    }
  }

  const totalQuestions = rows.length;
  const answered = correct + wrong;
  const percentage =
    totalMarks > 0 ? ((obtained / totalMarks) * 100).toFixed(2) : 0;

  const status = percentage >= 33 ? "pass" : "fail";

  /* ===== UPSERT RESULT ===== */
  await db.query(
    `
    INSERT INTO exam_results 
    (exam_id, student_id, attempt_id,
     total_questions, answered, correct, wrong, skipped,
     total_marks, obtained_marks, percentage, result_status)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ON DUPLICATE KEY UPDATE
      correct = VALUES(correct),
      wrong = VALUES(wrong),
      skipped = VALUES(skipped),
      obtained_marks = VALUES(obtained_marks),
      percentage = VALUES(percentage),
      result_status = VALUES(result_status)
    `,
    [
      attempt.exam_id,
      attempt.student_id,
      attempt.id,
      totalQuestions,
      answered,
      correct,
      wrong,
      skipped,
      totalMarks,
      obtained,
      percentage,
      status,
    ]
  );

  return {
    totalQuestions,
    correct,
    wrong,
    skipped,
    obtained,
    percentage,
    status,
  };
}
