import { db } from "@/lib/db";

const ALLOWED_ORIGINS = [
  "http://localhost:3001",
  "https://testolia-1ybct3gkp-ranjan-kumar-pandits-projects-7bee9bff.vercel.app",
  "https://application-form-ivory.vercel.app",
  "https://college-admission-form-37wh.vercel.app"
];

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

/* =========================
   OPTIONS
========================= */
export async function OPTIONS(req) {
  const origin = req.headers.get("origin");
  return new Response(null, {
    status: 204,
    headers: getCorsHeaders(origin),
  });
}

/* =========================
   GET /api/forms/:id
========================= */
export async function GET(req, context) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);
  const params = await context.params;
  const { id } = params;
  const [rows] = await db.query(
    "SELECT * FROM forms WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return new Response(
      JSON.stringify({ error: "Form not found" }),
      { status: 404, headers: corsHeaders }
    );
  }

  return new Response(JSON.stringify(rows[0]), {
    status: 200,
    headers: {
      "Content-Type": "application/json",
      ...corsHeaders,
    },
  });
}

/* =========================
   PUT /api/forms/:id
========================= */
export async function PUT(req, context) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  const { id } = await context.params; // 🔥 FIX IS HERE
  const body = await req.json();

  await db.query(
    "UPDATE forms SET name=?,theme=?, tabs=?, updatedAt=NOW() WHERE id=?",
    [body.name,JSON.stringify(body.theme),  JSON.stringify(body.tabs), id]
  );

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders }
  );
}

/* =========================
   DELETE /api/forms/:id
========================= */
export async function DELETE(req, context) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  const { id } = await context.params; // 🔥 FIX IS HERE

  await db.query("DELETE FROM forms WHERE id = ?", [id]);

  return new Response(
    JSON.stringify({ success: true }),
    { status: 200, headers: corsHeaders }
  );
}
