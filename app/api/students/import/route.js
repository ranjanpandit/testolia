import { db } from "@/lib/db";
import fs from "fs";
import csv from "csvtojson";
import * as XLSX from "xlsx";
import path from "path";

let parsedRows = []; // TEMP memory (safe for small imports)

export async function POST(req) {
  const { searchParams } = new URL(req.url);
  const commit = searchParams.get("commit");
  const mode = searchParams.get("mode") || "skip";
  
  // ---------------------------------
  // STEP 1: PARSE FILE (PREVIEW)
  // ---------------------------------
  if (!commit) {
    const formData = await req.formData();
    const file = formData.get("file");

    if (!file) {
      return Response.json({ error: "No file uploaded" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const ext = file.name.split(".").pop().toLowerCase();

    let rows = [];

    if (ext === "csv") {
      rows = await csv().fromString(buffer.toString());
    } else if (ext === "xlsx") {
      const wb = XLSX.read(buffer, { type: "buffer" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      rows = XLSX.utils.sheet_to_json(sheet);
    } else {
      return Response.json({ error: "Unsupported file" }, { status: 400 });
    }

    const errors = [];
    rows.forEach((r, i) => {
      if (!r.email && !r.phone) {
        errors.push(`Row ${i + 1}: email or phone required`);
      }
    });

    parsedRows = rows;

    return Response.json({
      rows: rows.slice(0, 200), // preview limit
      errors,
    });
  }

  // ---------------------------------
  // STEP 2: COMMIT TO DATABASE
  // ---------------------------------
  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  const year = new Date().getFullYear();
    const [[count]] = await db.query(
      "SELECT COUNT(*) AS c FROM students WHERE YEAR(createdAt) = ?",
      [year]
    );

    let seq = String(count.c + 1).padStart(4, "0");

  for (const row of parsedRows) {
    const email = row.email || null;
    const phone = row.phone || null;

    let existing = null;

    if (email) {
      const [r] = await db.query("SELECT id FROM students WHERE email=?", [email]);
      if (r.length) existing = r[0];
    }

    if (!existing && phone) {
      const [r] = await db.query("SELECT id FROM students WHERE phone=?", [phone]);
      if (r.length) existing = r[0];
    }

    if (existing) {
      if (mode === "update") {
        await db.query(
          `UPDATE students SET 
            first_name=?, last_name=?, phone=?, gender=?, dob=?, address=?, city=?, state=?, country=?, extra=? 
           WHERE id=?`,
          [
            row.first_name || row.firstName || null,
            row.last_name || row.lastName || null,
            phone,
            row.gender || null,
            row.dob || null,
            row.address || null,
            row.city || null,
            row.state || null,
            row.country || null,
            JSON.stringify(row),
            existing.id,
          ]
        );
        updated++;
      } else {
        skipped++;
      }
    } else {
        
        let student_code = `STU${year}${seq++}`;
      await db.query(
        `INSERT INTO students 
        (student_code,first_name, last_name, email, phone, gender, dob, address, city, state, country, extra)
        VALUES (?,?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          student_code,
          row.first_name || row.firstName || null,
          row.last_name || row.lastName || null,
          email,
          phone,
          row.gender || null,
          row.dob || null,
          row.address || null,
          row.city || null,
          row.state || null,
          row.country || null,
          JSON.stringify(row),
        ]
      );
      inserted++;
    }
  }

  parsedRows = []; // clear memory

  return Response.json({
    inserted,
    updated,
    skipped,
  });
}
