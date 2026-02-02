import { db } from "@/lib/db";

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  
  const page = parseInt(searchParams.get("page")) || 1;
  const limit = parseInt(searchParams.get("limit")) || 10;
  const offset = (page - 1) * limit;
  const search = searchParams.get("search") || "";
  const status = searchParams.get("status") || "all";
  const examId = searchParams.get("examId") || "all";

  try {
    // 1. Fetch available exams for the filter dropdown
    const [exams] = await db.query(`SELECT id, title FROM exams ORDER BY title ASC`);

    let queryArgs = [];
    let whereClauses = ["1=1"];

    if (search) {
      whereClauses.push("(s.first_name LIKE ? OR s.last_name LIKE ?)");
      queryArgs.push(`%${search}%`, `%${search}%`);
    }

    if (status !== "all") {
      whereClauses.push("er.result_status = ?");
      queryArgs.push(status);
    }

    if (examId !== "all") {
      whereClauses.push("er.exam_id = ?");
      queryArgs.push(examId);
    }

    const whereSql = whereClauses.join(" AND ");

    // 2. Get Total Count
    const [[{ total }]] = await db.query(
      `SELECT COUNT(*) as total FROM exam_results er 
       JOIN students s ON s.id = er.student_id 
       WHERE ${whereSql}`,
      queryArgs
    );

    // 3. Get Paginated Rows
    const [rows] = await db.query(
      `SELECT 
        er.*,
        CONCAT(s.first_name, ' ', COALESCE(s.last_name, '')) AS student_name,
        e.title AS exam_title
      FROM exam_results er
      JOIN students s ON s.id = er.student_id
      JOIN exams e ON e.id = er.exam_id
      WHERE ${whereSql}
      ORDER BY er.created_at DESC
      LIMIT ? OFFSET ?`,
      [...queryArgs, limit, offset]
    );

    return Response.json({
      rows,
      exams, // Sending exam list to populate the filter
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("ADMIN_RESULTS_FETCH_ERROR:", error);
    return Response.json({ message: "Internal Server Error" }, { status: 500 });
  }
}