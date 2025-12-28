import {db} from "@/lib/db";

export async function PUT(req, context) {
  const params = await context.params;
  const { role_id, status } = await req.json();

  await db.query(
    "UPDATE users SET role_id = ?, status = ? WHERE id = ?",
    [role_id, status, params.id]
  );

  return Response.json({ success: true });
}