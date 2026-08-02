import { db } from "@/lib/db";
import { ensureWebsiteTables } from "@/lib/website/tables";

export async function GET() {
  await ensureWebsiteTables();
  await db.query("INSERT IGNORE INTO website_settings (id) VALUES (1)");

  const [rows] = await db.query("SELECT * FROM website_settings WHERE id = 1");
  return Response.json(rows[0] || {});
}

export async function PUT(req) {
  await ensureWebsiteTables();
  const body = await req.json();

  await db.query(
    `INSERT INTO website_settings
      (id, schoolName, tagline, phone, email, address, about, facebookUrl, instagramUrl, youtubeUrl)
     VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON DUPLICATE KEY UPDATE
      schoolName = VALUES(schoolName),
      tagline = VALUES(tagline),
      phone = VALUES(phone),
      email = VALUES(email),
      address = VALUES(address),
      about = VALUES(about),
      facebookUrl = VALUES(facebookUrl),
      instagramUrl = VALUES(instagramUrl),
      youtubeUrl = VALUES(youtubeUrl)`,
    [
      body.schoolName || "",
      body.tagline || "",
      body.phone || "",
      body.email || "",
      body.address || "",
      body.about || "",
      body.facebookUrl || "",
      body.instagramUrl || "",
      body.youtubeUrl || "",
    ]
  );

  return Response.json({ success: true });
}
