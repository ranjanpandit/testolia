import { db } from "@/lib/db";

export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;

  // Fetch student info
  const [studentRows] = await db.query(
    "SELECT s.*, c.name AS class_name from students s LEFT JOIN student_classes sc  ON sc.student_id=s.id AND sc.status='active' LEFT JOIN classes c ON c.id=sc.class_id  WHERE s.id = ?",
    [id]
  );
  if (studentRows.length === 0) {
    return Response.json({ error: "Student not found" }, { status: 404 });
  }

  const student = studentRows[0];

  // Fetch documents
  const [docs] = await db.query(
    "SELECT * FROM student_documents WHERE student_id = ?",
    [id]
  );

  // Fetch application response linked to student (Optional)
  const [response] = await db.query(
    "SELECT * FROM form_responses WHERE studentId = ? LIMIT 1",
    [id]
  );

  return Response.json({
    student,
    documents: docs,
    response: response.length ? response[0] : null,
  });
}

export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;
  const body = await req.json();

  await db.query(
    `UPDATE students SET 
      first_name = ?, 
      last_name = ?, 
      email = ?, 
      phone = ?, 
      gender = ?, 
      dob = ?, 
      address = ?, 
      city = ?, 
      state = ?, 
      country = ?, 
      status = ?
    WHERE id = ?`,
    [
      body.first_name,
      body.last_name,
      body.email,
      body.phone,
      body.gender,
      body.dob,
      body.address,
      body.city,
      body.state,
      body.country,
      body.status || "pending",
      id
    ]
  );

  return Response.json({ success: true });
}

