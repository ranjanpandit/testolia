import { db } from "@/lib/db";

export async function POST(req) {
  const body = await req.json();
  const { name, examType, startDate, endDate, instructions, classIds, batchIds } = body;

  const [exam] = await db.query(
    "INSERT INTO exams (name, exam_type, start_date, end_date, instructions) VALUES (?, ?, ?, ?, ?)",
    [name, examType, startDate, endDate, instructions]
  );

  const examId = exam.insertId;

  if (classIds?.length) {
    for (const cid of classIds) {
      await db.query(
        "INSERT INTO exam_classes (exam_id, class_id) VALUES (?, ?)",
        [examId, cid]
      );
    }
  }

  if (batchIds?.length) {
    for (const bid of batchIds) {
      await db.query(
        "INSERT INTO exam_batches (exam_id, batch_id) VALUES (?, ?)",
        [examId, bid]
      );
    }
  }

  return Response.json({ success: true, examId });
}
export async function GET() {
  const [rows] = await db.query(`
    SELECT e.*,
      GROUP_CONCAT(DISTINCT c.name) AS classes
    FROM exams e
    LEFT JOIN exam_classes ec ON ec.exam_id = e.id
    LEFT JOIN classes c ON c.id = ec.class_id
    GROUP BY e.id
    ORDER BY e.createdAt DESC
  `);

  return Response.json(rows);
}
