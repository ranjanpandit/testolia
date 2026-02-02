import { generateResult } from "@/lib/resultEngine";

export async function POST(req) {
  const { attemptId } = await req.json();

  try {
    const result = await generateResult(attemptId);
    return Response.json({ success: true, result });
  } catch (e) {
    return Response.json({ message: e.message }, { status: 400 });
  }
}
