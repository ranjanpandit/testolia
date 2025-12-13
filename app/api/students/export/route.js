import { db } from "@/lib/db";

export async function GET() {
  const [rows] = await db.query(`
    SELECT
      student_code,
      first_name,
      last_name,
      email,
      phone,
      gender,
      dob,
      createdAt
    FROM students
    ORDER BY createdAt DESC
  `);

  let csv =
    "Student Code,First Name,Last Name,Email,Phone,Gender,DOB,Created At\n";

  rows.forEach((r) => {
    csv += `"${r.student_code}","${r.first_name || ""}","${r.last_name || ""}","${r.email || ""}","${r.phone || ""}","${r.gender || ""}","${r.dob || ""}","${r.createdAt}"\n`;
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=students.csv",
    },
  });
}
