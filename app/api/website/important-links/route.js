import { db } from "@/lib/db";
import { ensureWebsiteTables } from "@/lib/website/tables";

export async function GET() {
  await ensureWebsiteTables();
  const [rows] = await db.query(
    "SELECT * FROM website_important_links ORDER BY sortOrder ASC, id DESC"
  );
  return Response.json(rows);
}

export async function POST(req) {
  await ensureWebsiteTables();
  const body = await req.json();

  await db.query(
    `INSERT INTO website_important_links (title, url, sortOrder, status)
     VALUES (?, ?, ?, ?)`,
    [body.title, body.url, Number(body.sortOrder || 0), body.status || "active"]
  );

  return Response.json({ success: true });
}
