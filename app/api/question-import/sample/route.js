import { NextResponse } from "next/server";

export async function GET() {
  const csv = `question_text,question_type,option_a,option_b,option_c,option_d,correct_options,marks,negative_marks,subject,topic,difficulty,explanation
"What is 2 + 2?",mcq,"1","2","3","4","D",1,0,Maths,Arithmetic,Easy,"2+2 equals 4"
`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": "attachment; filename=questions_sample.csv",
    },
  });
}
