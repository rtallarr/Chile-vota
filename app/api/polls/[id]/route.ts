import { cookies } from "next/headers";
import { sql } from "@vercel/postgres";
import { randomUUID } from "crypto";

export async function POST(
  req: Request,
  { params }: { params: { id: string } }
) {
  const pollId = params.id;
  const { choice } = await req.json();

  if (!["yes", "no"].includes(choice))
    return new Response("Invalid choice", { status: 400 });

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
    await sql`
      INSERT INTO votes (poll_id, voter_id, choice)
      VALUES (${pollId}, ${voterId}, ${choice})
    `;
    return new Response("Vote registered", { status: 201 });
  } catch (err: unknown) {
    if (err instanceof Error && err.message.includes("duplicate key")) {
      return new Response("Already voted", { status: 409 });
    }
    console.error(err);
    return new Response("Internal Server Error", { status: 500 });
  }
}
