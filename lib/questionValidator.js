export function validateQuestions(rows) {
  const valid = [];
  const errors = [];

  rows.forEach((row, i) => {
    if (!row.question_text || !row.question_type) {
      errors.push({ row: i + 1, error: "Missing question_text or type" });
      return;
    }

    if (["mcq", "scq"].includes(row.question_type)) {
      if (!row.correct_options) {
        errors.push({ row: i + 1, error: "Correct option missing" });
        return;
      }
    }

    valid.push(row);
  });

  return { valid, errors };
}
