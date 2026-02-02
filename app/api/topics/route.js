import { db } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const subject = searchParams.get("subject") || "";

  let sql = `
    SELECT * 
    FROM topics 
    WHERE 1 
  `;
  const values = [];

  if (subject) {
    sql += ` AND subject_id = ?`;
    values.push(subject);
  }

  sql += ` ORDER BY id ASC`;
  const [rows] = await db.query(sql, values);
  return Response.json(rows);
}
