import { db } from "@/lib/db";

export async function POST(req) {
  const { classId, name, capacity, startDate } = await req.json();

  await db.query(
    "INSERT INTO batches (class_id, name, capacity, start_date) VALUES (?, ?, ?, ?)",
    [classId, name, capacity || null, startDate || new Date()]
  );

  return Response.json({ success: true });
}
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const classId = searchParams.get("classId");

  const [rows] = await db.query(
    "SELECT * FROM batches WHERE  status='active'",
    [classId]
  );

  return Response.json(rows);
}
