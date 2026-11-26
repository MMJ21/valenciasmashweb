import {
  getOwnPlayerProfile,
  isAccountDeletionPending,
  playerProfileInputSchema,
  isSupportedImage,
  MAX_AVATAR_BYTES,
  saveAvatar,
  updatePlayerAvatar,
  updatePlayerProfile,
} from "@/modules/players";
import { getAuth } from "@/modules/auth";
import { AppError } from "@/lib/errors";

async function readBoundedBody(request: Request, maxBytes: number): Promise<Uint8Array | null> {
  if (request.body === null) return new Uint8Array();
  const reader = request.body.getReader();
  const chunks: Uint8Array[] = [];
  let totalBytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      totalBytes += value.byteLength;
      if (totalBytes > maxBytes) {
        await reader.cancel();
        return null;
      }
      chunks.push(value);
    }
  } finally {
    reader.releaseLock();
  }
  const body = new Uint8Array(totalBytes);
  let offset = 0;
  for (const chunk of chunks) {
    body.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return body;
}

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
        {
          message:
            "La cuenta ya no está activa o se encuentra en proceso de eliminación. No se puede consultar la ficha.",
        },
        { status: 409 },
      );
    }
    return Response.json({ message: "No se encontró la ficha." }, { status: 404 });
  }
  return Response.json({ profile });
}

export async function POST(request: Request): Promise<Response> {
  const auth = await getAuth();
  const session = await auth.api.getSession({ headers: request.headers });
  if (session === null) {
    return Response.json({ message: "Inicia sesión para cambiar tu foto." }, { status: 401 });
  }
  const contentLength = Number(request.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > MAX_AVATAR_BYTES) {
    return Response.json({ message: "La foto debe ocupar como máximo 2 MB." }, { status: 413 });
  }
  const bytes = await readBoundedBody(request, MAX_AVATAR_BYTES);
  if (bytes === null || bytes.byteLength === 0) {
    return Response.json({ message: "La foto debe ocupar como máximo 2 MB." }, { status: 413 });
  }
  if (!isSupportedImage(bytes)) {
    return Response.json(
      { message: "El archivo debe ser JPEG, PNG o WebP válido." },
      { status: 400 },
    );
  }

  try {
    const avatarUrl = await saveAvatar(session.user.id, bytes);
    await updatePlayerAvatar(session.user.id, avatarUrl);
    return Response.json({ avatarUrl });
  } catch (error: unknown) {
    if (error instanceof AppError && error.code === "CONFLICT") {
      return Response.json({ message: error.message }, { status: 409 });
    }
    throw error;
  }
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

  try {
    await updatePlayerProfile({ userId: session.user.id, ...parsed.data });
  } catch (error: unknown) {
    if (error instanceof AppError && error.code === "CONFLICT") {
      return Response.json({ message: error.message }, { status: 409 });
    }
    throw error;
  }
  return Response.json({ status: "ok" });
}
