import { db } from "@/lib/db";
import { ensureWebsiteTables } from "@/lib/website/tables";

export async function PUT(req, { params }) {
  const { id } = await params;
  await ensureWebsiteTables();
  const body = await req.json();

  await db.query(
    `UPDATE website_important_links
     SET title = ?, url = ?, sortOrder = ?, status = ?
     WHERE id = ?`,
    [
      body.title,
      body.url,
      Number(body.sortOrder || 0),
      body.status || "active",
      id,
    ]
  );

  return Response.json({ success: true });
}

export async function DELETE(_req, { params }) {
  const { id } = await params;
  await ensureWebsiteTables();
  await db.query("DELETE FROM website_important_links WHERE id = ?", [id]);
  return Response.json({ success: true });
}
