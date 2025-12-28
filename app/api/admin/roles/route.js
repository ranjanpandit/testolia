import {db} from "@/lib/db";

export async function GET() {
  const [roles] = await db.query(
    "SELECT id, name, description FROM roles ORDER BY id"
  );
  return Response.json(roles);
}
