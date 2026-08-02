import { db } from "@/lib/db";

const ALLOWED_ORIGINS = [
  "http://localhost:3001",
  "https://testolia-1ybct3gkp-ranjan-kumar-pandits-projects-7bee9bff.vercel.app",
  "https://application-form-ivory.vercel.app",
  "https://college-admission-form-37wh.vercel.app",
];

let formsStatusChecked = false;

function getCorsHeaders(origin) {
  if (ALLOWED_ORIGINS.includes(origin)) {
    return {
      "Access-Control-Allow-Origin": origin,
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Allow-Credentials": "true",
    };
  }
  return {};
}

async function ensureFormsStatusColumn() {
  if (formsStatusChecked) return;

  const [columns] = await db.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'forms'
       AND COLUMN_NAME = 'status'`
  );

  if (!columns.length) {
    await db.query(
      "ALTER TABLE forms ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'draft'"
    );
  }

  formsStatusChecked = true;
}

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeForm(row) {
  return {
    ...row,
    theme: parseMaybeJson(row.theme),
    tabs: parseMaybeJson(row.tabs),
    status: row.status || "draft",
  };
}

export async function OPTIONS(req) {
  const origin = req.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

export async function GET(req, context) {
  await ensureFormsStatusColumn();

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  const params = await context.params;
  const { id } = params;
  const [rows] = await db.query("SELECT * FROM forms WHERE id = ?", [id]);

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Form not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(normalizeForm(rows[0])), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

export async function PUT(req, context) {
  await ensureFormsStatusColumn();

  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  const { id } = await context.params;
  const body = await req.json();
  const hasStatus = typeof body.status !== "undefined";

  if (hasStatus) {
    const status = body.status === "published" ? "published" : "draft";
    await db.query(
      "UPDATE forms SET name=?, theme=?, tabs=?, status=?, updatedAt=NOW() WHERE id=?",
      [
        body.name,
        JSON.stringify(body.theme),
        JSON.stringify(body.tabs),
        status,
        id,
      ]
    );
  } else {
    await db.query(
      "UPDATE forms SET name=?, theme=?, tabs=?, updatedAt=NOW() WHERE id=?",
      [body.name, JSON.stringify(body.theme), JSON.stringify(body.tabs), id]
    );
  }

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  });
}

export async function DELETE(req, context) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  const { id } = await context.params;

  await db.query("DELETE FROM forms WHERE id = ?", [id]);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  });
}
