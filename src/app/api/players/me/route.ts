import {
  getOwnPlayerProfile,
  isAccountDeletionPending,
  playerProfileInputSchema,
  updatePlayerProfile,
} from "@/modules/players";
import { getAuth } from "@/modules/auth";

export async function GET(request: Request): Promise<Response> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (session === null) {
    return Response.json({ message: "Inicia sesión para ver tu ficha." }, { status: 401 });
  }

  const profile = await getOwnPlayerProfile(session.user.id);
  if (profile === null) {
    if (await isAccountDeletionPending(session.user.id)) {
      return Response.json(
        { message: "La cuenta está en proceso de eliminación. No se puede consultar la ficha." },
        { status: 409 },
      );
    }
    return Response.json({ message: "No se encontró la ficha." }, { status: 404 });
  }
  return Response.json({ profile });
}

export async function PATCH(request: Request): Promise<Response> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (session === null) {
    return Response.json({ message: "Inicia sesión para editar tu ficha." }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json(
      { message: "El cuerpo de la petición no es JSON válido." },
      { status: 400 },
    );
  }

  const parsed = playerProfileInputSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json(
      { message: parsed.error.issues[0]?.message ?? "Revisa los datos de la ficha." },
      { status: 400 },
    );
  }

  await updatePlayerProfile({ userId: session.user.id, ...parsed.data });
  return Response.json({ status: "ok" });
}
