import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const pollId = params.id;
  const { choice } = await req.json();

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
      maxAge: 60 * 60 * 24 * 365,
    });
  }

  try {
    const { rows: polls } = await sql`
      SELECT option_a, option_b FROM polls WHERE id = ${pollId}
    `;
    if (polls.length === 0) return new Response("Poll not found", { status: 404 });

    const poll = polls[0];
    if (![poll.option_a, poll.option_b].includes(choice)) {
      return new Response("Invalid choice", { status: 400 });
    }

    // Prevent duplicate votes (by voterId)
    const { rows: existing } = await sql`
      SELECT 1 FROM votes WHERE poll_id = ${pollId} AND voter_id = ${voterId}
    `;
    if (existing.length > 0) {
      return new Response("Already voted", { status: 409 });
    }

    // Insert vote
    await sql`
      INSERT INTO votes (poll_id, voter_id, choice)
      VALUES (${pollId}, ${voterId}, ${choice})
    `;
    return new Response("Vote registered", { status: 201 });
  } catch (err: unknown) {
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}