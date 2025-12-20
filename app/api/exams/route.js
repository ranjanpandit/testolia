import { db } from "@/lib/db";

/* LIST EXAMS */
export async function GET() {
  const [rows] = await db.query(`
    SELECT e.*, ep.name AS pattern_name
    FROM exams e
    JOIN exam_patterns ep ON ep.id = e.pattern_id
    ORDER BY e.createdAt DESC
  `);

  return Response.json(rows);
}

/* CREATE EXAM */
export async function POST(req) {
  const body = await req.json();

  const {
    title,
    description,
    patternId,
    classId,
    batchId,
    startAt,
    endAt
  } = body;

  if (!title || !patternId || !startAt || !endAt) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  const [res] = await db.query(
    `INSERT INTO exams 
     (title, description, pattern_id, class_id, batch_id, start_at, end_at)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      title,
      description || null,
      patternId,
      classId || null,
      batchId || null,
      startAt,
      endAt
    ]
  );

  return Response.json({ id: res.insertId });
}
