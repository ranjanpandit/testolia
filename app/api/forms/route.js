import { db } from "@/lib/db";

let formsStatusChecked = false;

async function ensureFormsStatusColumn() {
  if (formsStatusChecked) return;

  const [columns] = await db.query(
    `SELECT COLUMN_NAME
     FROM INFORMATION_SCHEMA.COLUMNS
     WHERE TABLE_SCHEMA = DATABASE()
       AND TABLE_NAME = 'forms'
       AND COLUMN_NAME = 'status'`
  );

  if (!columns.length) {
    await db.query(
      "ALTER TABLE forms ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'draft'"
    );
  }

  formsStatusChecked = true;
}

function parseMaybeJson(value) {
  if (typeof value !== "string") return value;
  try {
    return JSON.parse(value);
  } catch {
    return value;
  }
}

function normalizeForm(row) {
  return {
    ...row,
    theme: parseMaybeJson(row.theme),
    tabs: parseMaybeJson(row.tabs),
    status: row.status || "draft",
  };
}

export async function POST(req) {
  await ensureFormsStatusColumn();
  const body = await req.json();
  const status = body.status === "published" ? "published" : "draft";

  const [result] = await db.query(
    "INSERT INTO forms (name,theme, tabs, status) VALUES (?,?, ?, ?)",
    [body.name, JSON.stringify(body.theme), JSON.stringify(body.tabs), status]
  );

  return Response.json({ id: result.insertId, ...body, status });
}

export async function PUT(req, ctx) {
  await ensureFormsStatusColumn();
  const params = await ctx.params;
  const { id } = params;

  const body = await req.json();
  const hasStatus = typeof body.status !== "undefined";

  if (hasStatus) {
    const status = body.status === "published" ? "published" : "draft";
    await db.query(
      "UPDATE forms SET name=?, theme=?, tabs=?, status=?, updatedAt=NOW() WHERE id=?",
      [body.name, JSON.stringify(body.theme), JSON.stringify(body.tabs), status, id]
    );
  } else {
    await db.query(
      "UPDATE forms SET name=?, theme=?, tabs=?, updatedAt=NOW() WHERE id=?",
      [body.name, JSON.stringify(body.theme), JSON.stringify(body.tabs), id]
    );
  }

  return Response.json({ id, ...body });
}


export async function GET() {
  await ensureFormsStatusColumn();
  const [rows] = await db.query("SELECT * FROM forms ORDER BY id DESC");
  return Response.json(rows.map(normalizeForm));
}
