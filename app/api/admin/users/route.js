import { db } from "@/lib/db";

export async function GET() {
  const [users] = await db.query(`
    SELECT 
      u.id,
      u.name,
      u.email,
      u.status,
      u.role_id,
      r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    ORDER BY u.id DESC
  `);

  return Response.json(users);
}

