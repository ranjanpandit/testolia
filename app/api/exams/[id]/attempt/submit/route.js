import { db } from "@/lib/db";
import { generateResult } from "@/lib/resultEngine";

export async function POST(req, { params }) {
  const { id } = await params;
  const body = await req.json();

  const [[attempt]] = await db.query(
    `SELECT * FROM exam_attempts WHERE exam_id=? AND status='in_progress'`,
    [id]
  );

  if (!attempt) return Response.json({ error: "No attempt" }, { status: 400 });

  await db.query(
    `UPDATE exam_attempts 
     SET status='completed',
         end_time=NOW(),
         exit_reason=? 
     WHERE id=?`,
    [body.reason || "MANUAL", attempt.id]
  );

  const result = await generateResult(attempt.id);

  return Response.json({ success: true, result });
}
