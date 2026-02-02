import { db } from "@/lib/db";

export async function GET(req) {
  const { search, status, classId, sortBy = 'id', order = 'DESC', page = 1, limit = 10 } =
    Object.fromEntries(new URL(req.url).searchParams);

  // 1. Security: Whitelist allowed sorting columns
  const allowedSortFields = ['id', 'first_name', 'email', 'class_name', 'status', 'student_code'];
  const sortField = allowedSortFields.includes(sortBy) ? sortBy : 'id';
  const sortOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

  let whereClauses = ["1=1"];
  let queryArgs = [];

  if (search) {
    whereClauses.push("(s.first_name LIKE ? OR s.last_name LIKE ? OR s.email LIKE ? OR s.phone LIKE ? OR s.student_code LIKE ?)");
    const searchParam = `%${search}%`;
    queryArgs.push(searchParam, searchParam, searchParam, searchParam, searchParam);
  }

  if (status) {
    whereClauses.push("s.status = ?");
    queryArgs.push(status);
  }

  if (classId && classId !== "all") {
    whereClauses.push("sc.class_id = ?");
    queryArgs.push(Number(classId));
  }

  const whereSql = whereClauses.join(" AND ");

  try {
    const [classes] = await db.query("SELECT id, name FROM classes ORDER BY name ASC");

    const [[{ total }]] = await db.query(
      `SELECT COUNT(DISTINCT s.id) AS total FROM students s 
       LEFT JOIN student_classes sc ON sc.student_id = s.id AND sc.status = 'active'
       WHERE ${whereSql}`,
      queryArgs
    );

    // 2. Apply Dynamic Sorting to the query
    // Note: class_name sorting is handled via the alias in the ORDER BY
    const [rows] = await db.query(
      `SELECT s.*, c.name AS class_name 
       FROM students s 
       LEFT JOIN student_classes sc ON sc.student_id = s.id AND sc.status = 'active'
       LEFT JOIN classes c ON c.id = sc.class_id 
       WHERE ${whereSql}
       ORDER BY ${sortField === 'class_name' ? 'c.name' : `s.${sortField}`} ${sortOrder}
       LIMIT ? OFFSET ?`,
      [...queryArgs, Number(limit), (Number(page) - 1) * Number(limit)]
    );

    return Response.json({
      data: rows,
      classes,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error("STUDENT_FETCH_ERROR:", error);
    return Response.json({ error: "Internal Server Error" }, { status: 500 });
  }
}


export async function POST(req) {
  let connection;
  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const body = await req.json();
    const {
      first_name, last_name, email, phone, gender, dob,
      address, city, state, country,
      class_id, batch_id, total_amount
    } = body;

    const year = new Date().getFullYear();
    const [countRows] = await connection.query(
      "SELECT COUNT(*) as c FROM students WHERE YEAR(createdAt) = ?",
      [year]
    );
    const seq = (countRows[0].c || 0) + 1;
    const student_code = `STU${year}${String(seq).padStart(4, "0")}`;

    const [studentResult] = await connection.query(
      `INSERT INTO students 
       (student_code, first_name, last_name, email, phone, gender, dob, address, city, state, country, status)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
      [student_code, first_name, last_name, email, phone, gender, dob || null, address, city, state, country]
    );

    const studentId = studentResult.insertId;

    if (class_id) {
      await connection.query(
        `INSERT INTO student_classes (student_id, class_id, batch_id, start_date, status) 
         VALUES (?, ?, ?, NOW(), 'active')`,
        [studentId, class_id, batch_id || null]
      );
    }

    if (batch_id) {
      await connection.query(
        `INSERT INTO student_batches (student_id, batch_id, start_date, status) 
         VALUES (?, ?, NOW(), 'active')`,
        [studentId, batch_id]
      );
    }

    if (total_amount) {
      await connection.query(
        `INSERT INTO student_fees (student_id, total_amount,fee_structure_id, paid_amount, status, assigned_at) 
         VALUES (?, ?,5, 0, 'pending', NOW())`,
        [studentId, total_amount]
      );
    }

    await connection.commit();
    return Response.json({ success: true, studentId, student_code });

  } catch (err) {
    if (connection) await connection.rollback();
    console.error("Enrollment Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  } finally {
    if (connection) connection.release();
  }
}
