import { db } from "@/lib/db";
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuid } from "uuid";

/* ----------------------------------------
   CORS CONFIG
---------------------------------------- */
const ALLOWED_ORIGINS = [
  "http://localhost:3001",
  "https://testolia-1ybct3gkp-ranjan-kumar-pandits-projects-7bee9bff.vercel.app",
  "https://college-admission-form-s1n2-8gy5ap9o0.vercel.app",
  "https://college-admission-form-s1n2.vercel.app",
];

function getCorsHeaders(origin) {
  if (origin && ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "*",
    };
  }
  return {};
}

/* ----------------------------------------
   OPTIONS (Preflight) – REQUIRED
---------------------------------------- */
export async function OPTIONS(req) {
  const origin = req.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/* ----------------------------------------
   POST – SAVE FORM RESPONSE
---------------------------------------- */
export async function POST(req) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    const formData = await req.formData();

    const formId = formData.get("formId");
    const studentId = formData.get("studentId");

    const data = {};
    const uploadsDir = path.join(process.cwd(), "public/uploads");

    for (const [key, value] of formData.entries()) {
      if (value instanceof File) {
        const bytes = await value.arrayBuffer();
        const buffer = Buffer.from(bytes);

        const ext = value.name.split(".").pop();
        const fileName = `${uuid()}.${ext}`;
        const filePath = path.join(uploadsDir, fileName);

        await writeFile(filePath, buffer);
        data[key] = `/uploads/${fileName}`;
      } else if (key !== "formId" && key !== "studentId") {
        data[key] = value;
      }
    }

    await db.query(
      "INSERT INTO form_responses (formId, studentId, data) VALUES (?, ?, ?)",
      [formId, studentId || null, JSON.stringify(data)]
    );

    return new Response(
      JSON.stringify({ success: true }),
      {
        status: 200,
        headers: corsHeaders,
      }
    );
  } catch (err) {
    console.error("POST ERROR:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}

/* ----------------------------------------
   GET – LIST FORM RESPONSES
---------------------------------------- */
export async function GET(req) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  try {
    const [rows] = await db.query(
      "SELECT id, formId, studentId, data, createdAt, status FROM form_responses ORDER BY createdAt DESC"
    );

    const parsed = rows.map((row) => {
      let json = row.data;

      if (Buffer.isBuffer(json)) json = json.toString();

      try {
        json = JSON.parse(json);
      } catch {
        json = { raw: json };
      }

      return {
        ...row,
        data: json,
      };
    });

    return new Response(JSON.stringify(parsed), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (err) {
    console.error("GET ERROR:", err);

    return new Response(
      JSON.stringify({ error: err.message }),
      {
        status: 500,
        headers: corsHeaders,
      }
    );
  }
}
