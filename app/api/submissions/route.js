import { db } from "@/lib/db";

export async function POST(req) {
  const body = await req.json();

  await db.query(
    "INSERT INTO submissions (formId, data) VALUES (?, ?)",
    [body.formId, JSON.stringify(body.data)]
  );

  return Response.json({ success: true });
}
