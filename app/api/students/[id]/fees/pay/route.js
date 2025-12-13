import { db } from "@/lib/db";

export async function POST(req, context) {
  const params = await context.params;
  const { id } = params;
  const body = await req.json();

  const { fee_id, amount, payment_mode, reference_no, remarks, paid_on } = body;

  // Insert payment
  await db.query(
    `INSERT INTO student_fee_payments 
     (student_id, fee_id, amount, payment_mode, reference_no, remarks, paid_on)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [id, fee_id, amount, payment_mode, reference_no, remarks, paid_on]
  );

  // Update fee totals
  await db.query(
    `
    UPDATE student_fees 
    SET 
      paid_amount = paid_amount + ?,
      status = CASE
        WHEN paid_amount + ? >= total_amount THEN 'paid'
        ELSE 'partial'
      END
    WHERE id = ?
    `,
    [amount, amount, fee_id]
  );

  return Response.json({ success: true });
}
