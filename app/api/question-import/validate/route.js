import { NextResponse } from "next/server";
import { parseCSV } from "@/lib/csvParser";
import { validateQuestions } from "@/lib/questionValidator";

export async function POST(req) {
  const formData = await req.formData();
  const file = formData.get("file");

  if (!file) {
    return NextResponse.json({ error: "File missing" }, { status: 400 });
  }

  const rows = await parseCSV(file);
  const { valid, errors } = validateQuestions(rows);

  return NextResponse.json({
    total: rows.length,
    valid: valid.length,
    errors,
    preview: valid.slice(0, 10),
    data: valid, // used later for commit
  });
}
