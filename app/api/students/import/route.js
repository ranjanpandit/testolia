import { db } from "@/lib/db";
import csv from "csvtojson";
import * as XLSX from "xlsx";

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const commit = searchParams.get("commit") === "1";
  const mode = searchParams.get("mode") || "skip";

  try {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) return Response.json({ error: "No file provided" }, { status: 400 });

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop().toLowerCase();
    let rows = [];

    // 1. Unified Parsing
    if (ext === "csv") {
      rows = await csv().fromString(buffer.toString());
    } else if (ext === "xlsx") {
      const wb = XLSX.read(buffer, { type: "buffer" });
      rows = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
    } else {
      return Response.json({ error: "Unsupported format" }, { status: 400 });
    }

    // 2. Validation Stage (Preview Mode)
    if (!commit) {
      const errors = [];
      rows.forEach((r, i) => {
        if (!r.email && !r.phone) errors.push(`Row ${i + 1}: Email or Phone required`);
        if (!r.first_name && !r.firstName) errors.push(`Row ${i + 1}: First Name required`);
      });
      return Response.json({ rows: rows.slice(0, 50), total: rows.length, errors });
    }

    // 3. Execution Stage (Commit Mode) with Transaction
    const connection = await db.getConnection();
    await connection.beginTransaction();

    let inserted = 0, updated = 0, skipped = 0;
    const year = new Date().getFullYear();
    const [[count]] = await connection.query("SELECT COUNT(*) AS c FROM students WHERE YEAR(createdAt) = ?", [year]);
    let currentSeq = count.c + 1;

    try {
      for (const row of rows) {
        const email = row.email || null;
        const phone = row.phone || null;
        const fName = row.first_name || row.firstName || null;
        const lName = row.last_name || row.lastName || null;

        // Check Duplicates
        const [existing] = await connection.query(
          "SELECT id FROM students WHERE (email IS NOT NULL AND email = ?) OR (phone IS NOT NULL AND phone = ?) LIMIT 1",
          [email, phone]
        );

        if (existing.length > 0) {
          if (mode === "update") {
            await connection.query(
              `UPDATE students SET first_name=?, last_name=?, gender=?, dob=?, address=?, city=?, state=?, status='active' WHERE id=?`,
              [fName, lName, row.gender || null, row.dob || null, row.address || null, row.city || null, row.state || null, existing[0].id]
            );
            updated++;
          } else {
            skipped++;
          }
        } else {
          const student_code = `STU${year}${String(currentSeq++).padStart(4, "0")}`;
          await connection.query(
            `INSERT INTO students (student_code, first_name, last_name, email, phone, gender, dob, address, status) 
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'active')`,
            [student_code, fName, lName, email, phone, row.gender || null, row.dob || null, row.address || null]
          );
          inserted++;
        }
      }
      await connection.commit();
    } catch (err) {
      await connection.rollback();
      throw err;
    } finally {
      connection.release();
    }

    return Response.json({ inserted, updated, skipped });

  } catch (error) {
    console.error("IMPORT_FATAL:", error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}