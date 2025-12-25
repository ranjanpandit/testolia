import { db } from "@/lib/db";

export async function POST(req) {
  const body = await req.json();

  const [result] = await db.query(
    "INSERT INTO forms (name,theme, tabs) VALUES (?,?, ?)",
    [body.name,body.themeKey, JSON.stringify(body.tabs)]
  );

  return Response.json({ id: result.insertId, ...body });
}

export async function PUT(req, ctx) {
  const params = await ctx.params;
  const { id } = params;

  const body = await req.json();

  await db.query(
    "UPDATE forms SET name=?, tabs=?, updatedAt=NOW() WHERE id=?",
    [body.name, JSON.stringify(body.tabs), id]
  );

  return Response.json({ id, ...body });
}


export async function GET() {
  const [rows] = await db.query("SELECT * FROM forms ORDER BY id DESC");
  return Response.json(rows);
}
