import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

export async function GET(req, context) {
  const params = await context.params;
  const { id } = params;

  const [rows] = await db.query(
    "SELECT * FROM form_responses WHERE id = ?",
    [id]
  );

  if (rows.length === 0) {
    return new Response(JSON.stringify({ error: "Response not found" }), {
      status: 404,
      headers: corsHeaders,
    });
  }

  return new Response(JSON.stringify(rows[0]), {
    status: 200,
    headers: corsHeaders,
  });
}
export async function PUT(req, context) {
  const params = await context.params;
  const { id } = params;
  const body = await req.json();

  const { status } = body;

  await db.query(
    "UPDATE form_responses SET status=? WHERE id=?",
    [status, id]
  );
  

  return Response.json({ success: true });
}