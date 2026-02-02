import { NextResponse } from "next/server";
import { generateErrorCSV } from "@/lib/errorCsv";

export async function POST(req) {
  const { errors } = await req.json();

  const csv = generateErrorCSV(errors);

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=question_import_errors.csv",
    },
  });
}
