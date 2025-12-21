import { db } from "@/lib/db";

// Common CORS headers
const corsHeaders = {
  "Access-Control-Allow-Origin": "*", // or change to your frontend URL
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

// ========================
// OPTIONS (CORS Preflight)
// ========================
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: corsHeaders,
  });
}

// ========================
// GET /api/forms/:id
// ========================
export async function GET(req, context) {
  const params = await context.params; 
  const { id } = params;

  console.log("API params:", params);

  const [rows] = await db.query("SELECT * FROM forms WHERE id = ?", [id]);

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

// ========================
// DELETE /api/forms/:id
// ========================
export async function DELETE(req, context) {
  const params = await context.params;
  const { id } = params;

  await db.query("DELETE FROM forms WHERE id = ?", [id]);

  return new Response(JSON.stringify({ success: true }), {
    status: 200,
    headers: corsHeaders,
  });
}

// ========================
// PUT /api/forms/:id
// ========================
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;

  const body = await req.json();

  await db.query(
    "UPDATE forms SET name=?, tabs=?, updatedAt=NOW() WHERE id=?",
    [body.name, JSON.stringify(body.tabs), id]
  );

  return new Response(JSON.stringify({ id, ...body }), {
    status: 200,
    headers: corsHeaders,
  });
}
