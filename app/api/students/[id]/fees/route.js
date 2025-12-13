import { db } from "@/lib/db";

export async function POST(req, { params }) {
  const { id } = params;
  const body = await req.json();

  const { total_amount } = body;

  await db.query(
    `INSERT INTO student_fees (student_id, total_amount) VALUES (?, ?)`,
    [id, total_amount]
  );

  return Response.json({ success: true });
}
export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;

  const [[fee]] = await db.query(
    "SELECT * FROM student_fees WHERE student_id = ?",
    [id]
  );

  const [payments] = await db.query(
    "SELECT * FROM student_fee_payments WHERE student_id = ? ORDER BY paid_on DESC",
    [id]
  );

  return Response.json({ fee, payments });
}