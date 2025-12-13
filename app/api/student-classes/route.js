import { db } from "@/lib/db";

export async function POST(req) {
  const { studentId, classId, startDate } = await req.json();

  if (!studentId || !classId) {
    return Response.json({ error: "Missing fields" }, { status: 400 });
  }

  // 1️⃣ End previous active class
  await db.query(
    "UPDATE student_classes SET status='completed', end_date=CURDATE() WHERE student_id=? AND status='active'",
    [studentId]
  );

  // 2️⃣ Insert new mapping with start date
  await db.query(
    `INSERT INTO student_classes (student_id, class_id, start_date)
     VALUES (?, ?, ?)`,
    [studentId, classId, startDate || new Date()]
  );

  return Response.json({ success: true });
}


// LIST mappings
export async function GET() {
  const [rows] = await db.query(`
    SELECT sc.*, 
           s.student_code, s.first_name, s.last_name,
           c.name AS class_name
    FROM student_classes sc
    JOIN students s ON s.id = sc.student_id
    JOIN classes c ON c.id = sc.class_id
    WHERE sc.status='active'
    ORDER BY sc.createdAt DESC
  `);

  return Response.json(rows);
}
