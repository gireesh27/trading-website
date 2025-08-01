// lib/auth.ts
import { getServerSession } from "next-auth";
import { authOptions } from "../../app/api/auth/[...nextauth]/route"; // correct path to your options

export async function auth() {
  return await getServerSession(authOptions);
}
