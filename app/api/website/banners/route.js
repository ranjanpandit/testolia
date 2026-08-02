import { db } from "@/lib/db";
import { ensureWebsiteTables } from "@/lib/website/tables";

export async function GET() {
  await ensureWebsiteTables();
  const [rows] = await db.query(
    "SELECT * FROM website_banners ORDER BY sortOrder ASC, id DESC"
  );
  return Response.json(rows);
}

export async function POST(req) {
  await ensureWebsiteTables();
  const body = await req.json();

  await db.query(
    `INSERT INTO website_banners (title, subtitle, imageUrl, linkUrl, sortOrder, status)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      body.title,
      body.subtitle || "",
      body.imageUrl || "",
      body.linkUrl || "",
      Number(body.sortOrder || 0),
      body.status || "active",
    ]
  );

  return Response.json({ success: true });
}
