import { db } from "@/lib/db";
import { ensureWebsiteTables, toSlug } from "@/lib/website/tables";

export async function GET() {
  await ensureWebsiteTables();
  const [rows] = await db.query(
    "SELECT * FROM website_sections ORDER BY sortOrder ASC, id DESC"
  );
  return Response.json(rows);
}

export async function POST(req) {
  await ensureWebsiteTables();
  const body = await req.json();
  const slug = body.slug || toSlug(body.title);

  await db.query(
    `INSERT INTO website_sections (title, slug, content, sortOrder, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      body.title,
      slug,
      body.content || "",
      Number(body.sortOrder || 0),
      body.status || "active",
    ]
  );

  return Response.json({ success: true });
}
