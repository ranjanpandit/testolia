import { db } from "@/lib/db";

export async function GET(req) {
  const { search, status, classId } = Object.fromEntries(new URL(req.url).searchParams);

  let whereClauses = ["1=1"];
  let queryArgs = [];

  // Rebuild filtering logic to match the listing API
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
    const [rows] = await db.query(
      `SELECT 
        s.student_code, s.first_name, s.last_name, s.email, s.phone, s.gender, s.dob, s.createdAt,
        c.name AS class_name
      FROM students s
      LEFT JOIN student_classes sc ON sc.student_id = s.id AND sc.status = 'active'
      LEFT JOIN classes c ON c.id = sc.class_id
      WHERE ${whereSql}
      ORDER BY s.createdAt DESC`,
      queryArgs
    );

    // CSV Generation
    let csv = "Student Code,First Name,Last Name,Email,Phone,Gender,DOB,Class,Created At\n";

    rows.forEach((r) => {
      // Formatted date for better Excel compatibility
      const dateStr = r.createdAt ? new Date(r.createdAt).toISOString().split('T')[0] : "";
      
      csv += `"${r.student_code}","${r.first_name || ""}","${r.last_name || ""}","${r.email || ""}","${r.phone || ""}","${r.gender || ""}","${r.dob || ""}","${r.class_name || "Unassigned"}","${dateStr}"\n`;
    });

    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": `attachment; filename=filtered_students_${new Date().getTime()}.csv`,
      },
    });
  } catch (error) {
    console.error("EXPORT_ERROR:", error);
    return new Response("Error generating export", { status: 500 });
  }
}