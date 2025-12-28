import jwt from "jsonwebtoken";

export async function GET(req) {
  const token = req.headers.get("authorization")?.split(" ")[1];
  if (!token) return Response.json({ authenticated: false });

  try {
    const user = jwt.verify(token, process.env.JWT_SECRET);
    return Response.json({ authenticated: true, user });
  } catch {
    return Response.json({ authenticated: false });
  }
}
