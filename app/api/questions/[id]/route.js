export async function GET(req, context) {
  const params = context.params      
  const { id } = params;

  const [[question]] = await db.query(
    "SELECT * FROM questions WHERE id = ?", [id]
  );

  const [options] = await db.query(
    "SELECT * FROM question_options WHERE question_id = ?", [id]
  );

  const [fills] = await db.query(
    "SELECT * FROM question_fill_answers WHERE question_id = ?", [id]
  );

  const [[integer]] = await db.query(
    "SELECT * FROM question_integer_answers WHERE question_id = ?", [id]
  );

  return Response.json({ question, options, fills, integer });
}
export async function PUT(req,context) {
        const params =context.params
  const { id } = params;
  const body = await req.json();

  await db.query(
    `UPDATE questions SET question_text=?, difficulty=?, subject=?, topic=?, explanation=?
     WHERE id=?`,
    [body.question_text, body.difficulty, body.subject, body.topic, body.explanation, id]
  );

  return Response.json({ success: true });
}
export async function DELETE(req, context) {
            const params =context.params
  await db.query("DELETE FROM questions WHERE id = ?", [params.id]);
  return Response.json({ success: true });
}

