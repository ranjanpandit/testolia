import { db } from "@/lib/db";
import fs from "fs";
import path from "path";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS });
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { responseId } = body;

    if (!responseId) {
      return new Response(JSON.stringify({ error: "responseId required" }), {
        status: 400,
        headers: CORS,
      });
    }

    // --------------------------------------
    // 1️⃣ Fetch form_response
    // --------------------------------------
    const [rows] = await db.query(
      "SELECT * FROM form_responses WHERE id = ?",
      [responseId]
    );
    if (!rows.length) {
      return new Response(JSON.stringify({ error: "Form response not found" }), {
        status: 404,
        headers: CORS,
      });
    }

    let resp = rows[0];
    let data = resp.data;

    // Handle buffer → string → JSON
    if (Buffer.isBuffer(data)) data = data.toString();
    if (typeof data === "string") {
      try {
        data = JSON.parse(data);
      } catch {
        data = { raw: data };
      }
    }

    // --------------------------------------
    // 2️⃣ Extract core student fields
    // --------------------------------------
    const get = (keys) => {
      for (const k of keys) {
        if (data[k]) return data[k];
      }
      return null;
    };

    const firstName = get(["firstName", "first_name", "fname"]);
    const lastName = get(["lastName", "last_name", "lname"]);
    const email = get(["email", "Email"]);
    const phone = get(["phone", "mobile"]);
    const gender = get(["gender"]);
    const dobRaw = get(["dob", "dateOfBirth"]);

    let dob = null;
    if (dobRaw) {
      const d = new Date(dobRaw);
      if (!isNaN(d)) dob = d.toISOString().slice(0, 10);
    }

    const address = get(["address"]);
    const city = get(["city"]);
    const state = get(["state"]);
    const country = get(["country"]);

    // --------------------------------------
    // 3️⃣ Check if student already exists
    // --------------------------------------
    let existingStudent = null;

    if (email) {
      const [eRows] = await db.query(
        "SELECT * FROM students WHERE email = ?",
        [email]
      );
      if (eRows.length) existingStudent = eRows[0];
    }

    if (!existingStudent && phone) {
      const [pRows] = await db.query(
        "SELECT * FROM students WHERE phone = ?",
        [phone]
      );
      if (pRows.length) existingStudent = pRows[0];
    }

    // --------------------------------------
    // 4️⃣ If student exists → update + save documents
    // --------------------------------------
    if (existingStudent) {
      const studentId = existingStudent.id;

      await db.query(
        `UPDATE students 
         SET first_name=?, last_name=?, phone=?, dob=?, address=?, city=?, state=?, country=?, 
         extra = JSON_MERGE_PATCH(IFNULL(extra, '{}'), ?) 
         WHERE id=?`,
        [
          firstName || existingStudent.first_name,
          lastName || existingStudent.last_name,
          phone || existingStudent.phone,
          dob || existingStudent.dob,
          address || existingStudent.address,
          city || existingStudent.city,
          state || existingStudent.state,
          country || existingStudent.country,
          JSON.stringify(data),
          studentId,
        ]
      );

      await saveDocumentsForStudent(studentId, data, responseId);

      await db.query(
        "UPDATE form_responses SET status = 'approved' WHERE id = ?",
        [responseId]
      );

      return new Response(
        JSON.stringify({ success: true, existing: true, studentId }),
        { status: 200, headers: CORS }
      );
    }

    // --------------------------------------
    // 5️⃣ Create NEW student (generate student_code)
    // --------------------------------------
    const year = new Date().getFullYear();
    const [[count]] = await db.query(
      "SELECT COUNT(*) AS c FROM students WHERE YEAR(createdAt) = ?",
      [year]
    );

    const seq = String(count.c + 1).padStart(4, "0");
    const student_code = `STU${year}${seq}`;

    const [insert] = await db.query(
      `INSERT INTO students 
       (student_code, first_name, last_name, email, phone, gender, dob, address, city, state, country, extra) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student_code,
        firstName,
        lastName,
        email,
        phone,
        gender,
        dob,
        address,
        city,
        state,
        country,
        JSON.stringify(data),
      ]
    );

    const studentId = insert.insertId;

    // --------------------------------------
    // 6️⃣ Save documents
    // --------------------------------------
    await saveDocumentsForStudent(studentId, data, responseId);

    // --------------------------------------
    // 7️⃣ Mark form as approved
    // --------------------------------------
    await db.query(
      "UPDATE form_responses SET status = 'approved' WHERE id = ?",
      [responseId]
    );

    return new Response(JSON.stringify({ success: true, studentId }), {
      status: 201,
      headers: CORS,
    });
  } catch (err) {
    console.error("Create student error:", err);
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS,
    });
  }
}

// --------------------------------------------------------------
// 🔥 Document Handling Function
// --------------------------------------------------------------
async function saveDocumentsForStudent(studentId, data) {
  const uploadsRoot = path.join(process.cwd(), "uploads");
  const studentFolder = path.join(uploadsRoot, "students", String(studentId));

  if (!fs.existsSync(studentFolder))
    fs.mkdirSync(studentFolder, { recursive: true });

  const documents = [];

  const scan = (obj, prefix = "") => {
    if (!obj || typeof obj !== "object") return;
    for (const [key, val] of Object.entries(obj)) {
      const keyPath = prefix ? `${prefix}.${key}` : key;

      if (typeof val === "string" && val.includes("uploads")) {
        documents.push({ field: keyPath, src: val });
      } else if (val && typeof val === "object" && val.path) {
        documents.push({ field: keyPath, src: val.path });
      } else if (typeof val === "object") {
        scan(val, keyPath);
      }
    }
  };

  scan(data);

  for (const doc of documents) {
    try {
      const source = path.join(
        process.cwd(),
        doc.src.replace(/^\//, "")
      );

      if (!fs.existsSync(source)) continue;

      const fileName = `${Date.now()}-${path.basename(source)}`;
      const target = path.join(studentFolder, fileName);

      fs.copyFileSync(source, target);

      const dbPath = `/uploads/students/${studentId}/${fileName}`;

      await db.query(
        `INSERT INTO student_documents (student_id, type, file_path, original_name)
         VALUES (?, ?, ?, ?)`,
        [studentId, doc.field, dbPath, path.basename(source)]
      );
    } catch (err) {
      console.error("Document save error:", err);
    }
  }
}
