import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

export async function GET() {
  const cookieStore = await cookies();
  let voterId = cookieStore.get("voterId")?.value;

  if (!voterId) {
    voterId = randomUUID();
    cookieStore.set({
      name: "voterId",
      value: voterId,
      httpOnly: true,
      sameSite: "strict",
      path: "/",
      maxAge: 60 * 60 * 24 * 365, // 1 year
    });
  }

  const { rows: polls } = await sql`
    SELECT id, question,
      (SELECT COUNT(*) FROM votes WHERE poll_id = polls.id AND choice = 'yes') AS votes_yes,
      (SELECT COUNT(*) FROM votes WHERE poll_id = polls.id AND choice = 'no') AS votes_no,
      EXISTS (
        SELECT 1 FROM votes WHERE poll_id = polls.id AND voter_id = ${voterId}
      ) AS "userVoted"
    FROM polls
    ORDER BY created_at ASC
  `;

  return Response.json(polls);
}

export async function POST(req: Request) {
  const { question } = await req.json();
  if (!question?.trim()) {
    return new Response("Missing question", { status: 400 });
  }

  await sql`INSERT INTO polls (question) VALUES (${question})`;
  return new Response("Poll created", { status: 201 });
}
