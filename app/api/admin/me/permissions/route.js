import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

/**
 * GET /api/admin/me/permissions
 * Reads JWT → gets userId → fetches permissions
 */
export async function GET(req) {
  try {
    const auth = req.headers.get("authorization");

    if (!auth) {
      return Response.json(
        { permissions: [] },
        { status: 401 }
      );
    }

    const token = auth.replace("Bearer ", "");

    // ✅ Verify token
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    // payload.id was set during login
    const userId = payload.id;

    // ✅ Get role_id from users table
    const [[user]] = await db.query(
      "SELECT role_id FROM users WHERE id = ?",
      [userId]
    );

    if (!user) {
      return Response.json(
        { permissions: [] },
        { status: 401 }
      );
    }

    // ✅ Fetch permissions for role
    const [rows] = await db.query(`
      SELECT p.key
      FROM permissions p
      JOIN role_permissions rp ON rp.permission_id = p.id
      WHERE rp.role_id = ?
    `, [user.role_id]);

    return Response.json({
      permissions: rows.map(r => r.key),
    });

  } catch (err) {
    console.error("Permission API error:", err);
    return Response.json(
      { permissions: [] },
      { status: 401 }
    );
  }
}
