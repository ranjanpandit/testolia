import { db } from "@/lib/db";

export async function POST(req) {
  try {
    const body = await req.json();
    const { studentId, feeStructureId } = body;

    if (!studentId || !feeStructureId) {
      return Response.json(
        { error: "studentId and feeStructureId required" },
        { status: 400 }
      );
    }

    // fetch fee structure
    const [[fee]] = await db.query(
      "SELECT total_amount FROM fee_structures WHERE id = ?",
      [feeStructureId]
    );

    if (!fee) {
      return Response.json({ error: "Fee structure not found" }, { status: 404 });
    }

    // assign to student
    await db.query(
      `INSERT INTO student_fees 
       (student_id, fee_structure_id, total_amount, paid_amount, status)
       VALUES (?, ?, ?, 0, 'pending')`,
      [studentId, feeStructureId, fee.total_amount]
    );

    return Response.json({ success: true });
  } catch (err) {
    return Response.json({ error: err.message }, { status: 500 });
  }
}
export async function GET(req) {
  const { search, status, page = 1, limit = 10 } =
    Object.fromEntries(new URL(req.url).searchParams);

  let query = "SELECT id,first_name,last_name WHERE 1=1";
  let params = [];

   const [rows] = await db.query(query, params);

  const [[{ total }]] = await db.query(
    "SELECT COUNT(*) AS total FROM students"
  );

  return Response.json({
    data: rows,
    total,
    page: Number(page),
    pages: Math.ceil(total / limit),
  });
}