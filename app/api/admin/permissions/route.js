import { db } from "@/lib/db";

export async function GET() {
  const [rows] = await db.query("SELECT id, name FROM permissions");
  return Response.json(rows);
}
