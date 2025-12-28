import { db } from "@/lib/db";

export async function PUT(req) {
  const { id, role_id, status } = await req.json();

  await db.query(
    "UPDATE users SET role_id = ?, status = ? WHERE id = ?",
    [role_id, status, id]
  );

  return Response.json({ success: true });
}
