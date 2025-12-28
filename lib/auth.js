import jwt from "jsonwebtoken";

export function getAuthUser(req) {
  const cookie = req.headers.get("cookie") || "";
  const token = cookie
    .split("; ")
    .find((c) => c.startsWith("token="))
    ?.split("=")[1];

  if (!token) return null;

  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    return null;
  }
}


export const logout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  window.location.href = "/login";
};
