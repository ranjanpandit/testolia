import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { db } from "@/lib/db";

export async function POST(req) {
  const { email, password } = await req.json();

  const [[user]] = await db.query(
    `
    SELECT u.id, u.name, u.email, u.role_id, u.status, r.name AS role
    FROM users u
    JOIN roles r ON r.id = u.role_id
    WHERE u.email = ? AND u.status = 'active'
    `,
    [email]
  );

  if (!user) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 🔐 Get hashed password separately
  const [[pwdRow]] = await db.query(
    `SELECT password FROM users WHERE id = ?`,
    [user.id]
  );

  const valid = await bcrypt.compare(password, pwdRow.password);
  if (!valid) {
    return Response.json({ error: "Invalid credentials" }, { status: 401 });
  }

  // 🔑 Fetch permissions
  const [permissions] = await db.query(
    `
    SELECT p.key
    FROM permissions p
    JOIN role_permissions rp ON rp.permission_id = p.id
    WHERE rp.role_id = ?
    `,
    [user.role_id]
  );

  const permissionKeys = permissions.map((p) => p.key);

  // 🔐 JWT
  const token = jwt.sign(
    {
      id: user.id,
      role: user.role,
      permissions: permissionKeys,
    },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  // ✅ RETURN USER ALSO
  return Response.json({
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: permissionKeys,
    },
  });
}
