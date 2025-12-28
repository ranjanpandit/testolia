import { db } from "@/lib/db";

export async function GET(req, context) {
  const params = await context.params;
  const roleId = params.id;

  const [allPermissions] = await db.query(
    "SELECT id, `key`, description FROM permissions ORDER BY `key`"
  );
  const [assigned] = await db.query(
    "SELECT permission_id FROM role_permissions WHERE role_id = ?",
    [roleId]
  );

  const assignedIds = assigned.map(p => p.permission_id);

  return Response.json({
    all: allPermissions,
    assigned: assignedIds,
  });
}

export async function POST(req, context) {
  const params = await context.params;
  const roleId = params.id;
  const { permissions } = await req.json(); // array of permission IDs

  await db.query("DELETE FROM role_permissions WHERE role_id = ?", [roleId]);

  if (permissions.length > 0) {
    const values = permissions.map(pid => [roleId, pid]);
    await db.query(
      "INSERT INTO role_permissions (role_id, permission_id) VALUES ?",
      [values]
    );
  }

  return Response.json({ success: true });
}