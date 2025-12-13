// GET /api/students/[id]/fee-payments
import { db } from "@/lib/db";

export async function GET(req, context) {
 const params = await context.params;
  const { id } = params;

  const [rows] = await db.query(
    `SELECT * FROM student_fee_payments
     WHERE student_id = ?
     ORDER BY paid_on DESC`,
    [id]
  );

  return Response.json(rows);
}
