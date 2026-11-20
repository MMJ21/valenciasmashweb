import { listPlayersForDevelopment } from "@/modules/players";

export async function GET(): Promise<Response> {
  if (process.env.NODE_ENV !== "development") {
    return new Response(null, { status: 404 });
  }

  const records = await listPlayersForDevelopment();

  return Response.json({ players: records });
}
