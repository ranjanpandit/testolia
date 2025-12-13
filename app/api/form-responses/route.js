import { db } from "@/lib/db";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

/* ----------------------------------------
   SAVE FORM RESPONSE  (POST)
---------------------------------------- */
export async function POST(req) {
  try {
    const body = await req.json();
    const { formId, studentId, data } = body;

    await db.query(
      "INSERT INTO form_responses (formId, studentId, data) VALUES (?, ?, ?)",
      [formId, studentId || null, JSON.stringify(data)]
    );

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: corsHeaders,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}

/* ----------------------------------------
   GET ALL RESPONSES  (LIST)
---------------------------------------- */
export async function GET() {
  try {
    const [rows] = await db.query(
      "SELECT id, formId, studentId, data, createdAt,status FROM form_responses ORDER BY createdAt DESC"
    );

    const parsed = rows.map((row) => {
      let json = row.data;

      // Fix: Convert Buffer → string
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
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: corsHeaders,
    });
  }
}
