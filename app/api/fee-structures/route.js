import { db } from "@/lib/db";

export async function GET() {
  const [rows] = await db.query(`
    SELECT 
      fs.id,
      fs.total_amount,
      c.name AS class_name,
      b.name AS batch_name
    FROM fee_structures fs
    JOIN classes c ON c.id = fs.class_id
    LEFT JOIN batches b ON b.id = fs.batch_id
    ORDER BY c.name
  `);

  return Response.json(rows);
}
