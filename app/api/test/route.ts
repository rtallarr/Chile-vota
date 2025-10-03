// app/api/test/route.ts
import { sql } from "@vercel/postgres";

export async function GET() {
  const { rows } = await sql`SELECT NOW() as time`;
  return Response.json(rows);
}