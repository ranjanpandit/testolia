import { db } from "@/lib/db";
import { ensureWebsiteTables } from "@/lib/website/tables";

export async function GET() {
  await ensureWebsiteTables();
  const [rows] = await db.query(
    "SELECT * FROM website_notifications ORDER BY publishDate DESC, id DESC"
  );
  return Response.json(rows);
}

export async function POST(req) {
  await ensureWebsiteTables();
  const body = await req.json();

  await db.query(
    `INSERT INTO website_notifications (title, message, linkUrl, publishDate, status)
     VALUES (?, ?, ?, ?, ?)`,
    [
      body.title,
      body.message || "",
      body.linkUrl || "",
      body.publishDate || null,
      body.status || "active",
    ]
  );

  return Response.json({ success: true });
}
