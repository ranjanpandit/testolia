import { db } from "@/lib/db";

export async function POST(req) {
  const { classId, batchId, totalAmount } = await req.json();

  await db.query(
    `INSERT INTO fee_structures (class_id, batch_id, total_amount)
     VALUES (?, ?, ?)`,
    [classId, batchId, totalAmount]
  );

  return Response.json({ success: true });
}
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;
  const body = await req.json();

  await db.query(
    `UPDATE fee_structures 
     SET class_id=?, batch_id=?, total_amount=? 
     WHERE id=?`,
    [
      body.classId,
      body.batchId,
      body.totalAmount,
      id,
    ]
  );

  return Response.json({ success: true });
}
export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;
  const [rows] = await db.query(`
    SELECT fs.*, c.name AS className, b.name AS batchName
    FROM fee_structures fs
    LEFT JOIN classes c ON c.id = fs.class_id
    LEFT JOIN batches b ON b.id = fs.batch_id WHERE fs.id=?`,
    [id]
  );

  return Response.json(rows[0]);
}
