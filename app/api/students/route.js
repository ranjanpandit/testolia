import { db } from "@/lib/db";

export async function GET(req) {
  const { search, status, page = 1, limit = 10 } =
    Object.fromEntries(new URL(req.url).searchParams);

  let query = "SELECT s.*, c.name AS class_name from students s LEFT JOIN student_classes sc  ON sc.student_id=s.id AND sc.status='active' LEFT JOIN classes c ON c.id=sc.class_id WHERE 1=1";
  let params = [];

  if (search) {
    query += " AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR phone LIKE ? OR c.name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  if (status) {
    query += " AND s.status = ?";
    params.push(status);
  }
  
  query += " ORDER BY s.id DESC LIMIT ? OFFSET ?";
  params.push(Number(limit), (Number(page) - 1) * Number(limit));
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
export async function POST(req) {
  try {
    const body = await req.json();
    const {
      first_name,
      last_name,
      email,
      phone,
      gender,
      dob,
      address,
      city,
      state,
      country,
    } = body;

    // 1) Generate student_code
    const year = new Date().getFullYear();
    const [countRows] = await db.query(
      "SELECT COUNT(*) as c FROM students WHERE YEAR(createdAt)=?",
      [year]
    );
    const seq = (countRows[0].c || 0) + 1;
    const student_code = `STU${year}${String(seq).padStart(4, "0")}`;

    // 2) Insert student
    const [result] = await db.query(
      `INSERT INTO students 
       (student_code, first_name, last_name, email, phone, gender, dob, address, city, state, country)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_code,
        first_name || null,
        last_name || null,
        email || null,
        phone || null,
        gender || null,
        dob || null,
        address || null,
        city || null,
        state || null,
        country || null,
      ]
    );

    return Response.json({
      success: true,
      studentId: result.insertId,
      student_code,
    });
  } catch (err) {
    console.error("Add Student Error:", err);
    return Response.json({ error: err.message }, { status: 500 });
  }
}
