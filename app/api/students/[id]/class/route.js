import { db } from "@/lib/db";

// GET current class of a student
export async function GET(req, { params }) {
  const [rows] = await db.query(
    `SELECT sc.*, c.name AS class_name
     FROM student_classes sc
     JOIN classes c ON c.id=sc.class_id
     WHERE sc.student_id=? AND sc.status='active'`,
    [params.id]
  );

  return Response.json(rows[0] || null);
}
