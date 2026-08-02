import { db } from "@/lib/db";
import { ensureWebsiteTables } from "@/lib/website/tables";

export async function PUT(req, { params }) {
  const { id } = await params;
  await ensureWebsiteTables();
  const body = await req.json();

  await db.query(
    `UPDATE website_notifications
     SET title = ?, message = ?, linkUrl = ?, publishDate = ?, status = ?
     WHERE id = ?`,
    [
      body.title,
      body.message || "",
      body.linkUrl || "",
      body.publishDate || null,
      body.status || "active",
      id,
    ]
  );

  return Response.json({ success: true });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  await ensureWebsiteTables();
  await db.query("DELETE FROM website_notifications WHERE id = ?", [id]);
  return Response.json({ success: true });
}
