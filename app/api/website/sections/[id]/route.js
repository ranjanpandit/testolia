import { db } from "@/lib/db";
import { ensureWebsiteTables, toSlug } from "@/lib/website/tables";

export async function PUT(req, { params }) {
  const { id } = await params;
  await ensureWebsiteTables();
  const body = await req.json();
  const slug = body.slug || toSlug(body.title);

  await db.query(
    `UPDATE website_sections
     SET title = ?, slug = ?, content = ?, sortOrder = ?, status = ?
     WHERE id = ?`,
    [
      body.title,
      slug,
      body.content || "",
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
  await db.query("DELETE FROM website_sections WHERE id = ?", [id]);
  return Response.json({ success: true });
}
