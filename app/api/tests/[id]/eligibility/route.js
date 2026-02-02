import { db } from "@/lib/db";

/* =========================
   GET ASSIGNMENTS
========================= */
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    // All classes
    const [classes] = await db.query(
      `SELECT id, name FROM classes ORDER BY name`
    );

    // All batches
    const [batches] = await db.query(
      `SELECT id, name FROM batches ORDER BY name`
    );

    // Assigned classes
    const [assignedClasses] = await db.query(
      `SELECT class_id FROM exam_classes WHERE exam_id = ?`,
      [id]
    );

    // Assigned batches
    const [assignedBatches] = await db.query(
      `SELECT batch_id FROM exam_batches WHERE exam_id = ?`,
      [id]
    );

    return Response.json({
      classes,
      batches,
      assigned: {
        classes: assignedClasses.map((c) => c.class_id),
        batches: assignedBatches.map((b) => b.batch_id),
      },
    });
  } catch (err) {
    console.error("GET exam eligibility error:", err);
    return Response.json(
      { message: "Failed to load eligibility data" },
      { status: 500 }
    );
  }
}

/* =========================
   UPDATE ASSIGNMENTS
========================= */
export async function POST(req, { params }) {
  try {
    const { id } = await params;
    const { class_ids = [], batch_ids = [] } = await req.json();

    /* -------- CLEAR OLD MAPPINGS -------- */
    await db.query(
      `DELETE FROM exam_classes WHERE exam_id = ?`,
      [id]
    );

    await db.query(
      `DELETE FROM exam_batches WHERE exam_id = ?`,
      [id]
    );

    /* -------- INSERT NEW CLASSES -------- */
    if (class_ids.length > 0) {
      const classValues = class_ids.map((cid) => [id, cid]);

      await db.query(
        `INSERT INTO exam_classes (exam_id, class_id) VALUES ?`,
        [classValues]
      );
    }

    /* -------- INSERT NEW BATCHES -------- */
    if (batch_ids.length > 0) {
      const batchValues = batch_ids.map((bid) => [id, bid]);

      await db.query(
        `INSERT INTO exam_batches (exam_id, batch_id) VALUES ?`,
        [batchValues]
      );
    }

    return Response.json({ success: true });
  } catch (err) {
    console.error("POST exam eligibility error:", err);
    return Response.json(
      { message: "Failed to update eligibility" },
      { status: 500 }
    );
  }
}
