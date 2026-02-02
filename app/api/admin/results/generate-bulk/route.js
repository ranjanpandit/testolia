import { db } from "@/lib/db";
import { generateResult } from "@/lib/resultEngine";

export async function POST(req) {
  try {
    const { examId } = await req.json();

    if (!examId) {
      return Response.json({ message: "Exam ID required" }, { status: 400 });
    }

    // Find attempts not yet evaluated
    const [attempts] = await db.query(`
      SELECT ea.id
      FROM exam_attempts ea
      LEFT JOIN exam_results er
        ON er.attempt_id = ea.id
      WHERE ea.exam_id = ?
        AND ea.status = 'submitted'
        AND er.id IS NULL
    `, [examId]);

    if (!attempts.length) {
      return Response.json({ message: "No pending attempts" });
    }

    let success = 0;
    let failed = 0;

    for (const a of attempts) {
      try {
        await generateResult(a.id);
        success++;
      } catch (e) {
        failed++;
        console.error("Result failed for attempt", a.id);
      }
    }

    return Response.json({
      success: true,
      total: attempts.length,
      generated: success,
      failed,
    });

  } catch (err) {
    console.error(err);
    return Response.json({ message: "Server Error" }, { status: 500 });
  }
}
