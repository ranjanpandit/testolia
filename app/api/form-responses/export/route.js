import { db } from "@/lib/db";

export async function GET() {
  const [rows] = await db.query(
    "SELECT id, formId, studentId, data, createdAt FROM form_responses ORDER BY createdAt DESC"
  );

  if (rows.length === 0) {
    return new Response("No data available", {
      headers: { "Content-Type": "text/plain" }
    });
  }

  // Step 1 — Collect all keys from JSON data
  const allKeys = new Set();

  rows.forEach(row => {
    let d = row.data;
    if (typeof d === "string") d = JSON.parse(d);
    Object.keys(d).forEach(k => allKeys.add(k));
  });

  const dynamicKeys = Array.from(allKeys); // Convert Set → Array

  // Step 2 — Build header row
  let csv = [
    "ID",
    "Form ID",
    "Student ID",
    "Created At",
    ...dynamicKeys.map(key => `"${key}"`)
  ].join(",") + "\n";

  // Step 3 — Build rows
  rows.forEach(row => {
    let d = row.data;
    if (typeof d === "string") d = JSON.parse(d);

    const dynamicValues = dynamicKeys.map(key => {
      let val = d[key] ?? "";
      if (val instanceof Object && "name" in val) {
        val = val.name; // For files or objects
      }
      return `"${String(val).replace(/"/g, '""')}"`;
    });

    csv += [
      row.id,
      row.formId,
      row.studentId ?? "",
      row.createdAt,
      ...dynamicValues
    ].join(",") + "\n";
  });

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=responses.csv",
    },
  });
}
