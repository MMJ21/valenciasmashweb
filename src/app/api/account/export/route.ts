import { getAuth } from "@/modules/auth";
import { exportAccountData } from "@/modules/players";

export async function GET(request: Request): Promise<Response> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (session === null) {
    return Response.json(
      { message: "Inicia sesión para descargar tus datos." },
      { status: 401, headers: { "Cache-Control": "no-store" } },
    );
  }

  const data = await exportAccountData(session.user.id);
  if (data === null) {
    return Response.json(
      { message: "La cuenta no está activa y no se puede exportar." },
      { status: 409, headers: { "Cache-Control": "no-store" } },
    );
  }

  const date = data.exportedAt.slice(0, 10);
  return new Response(JSON.stringify(data, null, 2), {
    headers: {
      "Cache-Control": "private, no-store, max-age=0",
      "Content-Disposition": `attachment; filename="valenciasmash-datos-${date}.json"`,
      "Content-Type": "application/json; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
