import { db } from "@/lib/db";

// ✅ Allowed frontend origins (add more if needed)
const ALLOWED_ORIGINS = [
  "https://testolia-1ybct3gkp-ranjan-kumar-pandits-projects-7bee9bff.vercel.app",
];

// ✅ Helper to build CORS headers dynamically
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
   OPTIONS (Preflight)
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
export async function GET(req, { params }) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  const { id } = params;
  return new Response(
        JSON.stringify({ error: "Form not found testing" }),
        { status: 404, headers: corsHeaders }
      );

  try {
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
  } catch (error) {
    console.error("GET form error:", error);
    return new Response(
      JSON.stringify({ error: "Internal Server Error" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

/* =========================
   PUT /api/forms/:id
========================= */
export async function PUT(req, { params }) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  const { id } = params;
  const body = await req.json();

  try {
    await db.query(
      "UPDATE forms SET name=?, tabs=?, updatedAt=NOW() WHERE id=?",
      [body.name, JSON.stringify(body.tabs), id]
    );

    return new Response(
      JSON.stringify({ success: true, id }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("PUT form error:", error);
    return new Response(
      JSON.stringify({ error: "Update failed" }),
      { status: 500, headers: corsHeaders }
    );
  }
}

/* =========================
   DELETE /api/forms/:id
========================= */
export async function DELETE(req, { params }) {
  const origin = req.headers.get("origin");
  const corsHeaders = getCorsHeaders(origin);

  const { id } = params;

  try {
    await db.query("DELETE FROM forms WHERE id = ?", [id]);

    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: corsHeaders }
    );
  } catch (error) {
    console.error("DELETE form error:", error);
    return new Response(
      JSON.stringify({ error: "Delete failed" }),
      { status: 500, headers: corsHeaders }
    );
  }
}
