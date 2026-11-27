import { z } from "zod";
import { armE2EAvatarWrite, releaseE2EAvatarWrite } from "@/lib/e2e/avatar-upload-barrier";

const barrierRequestSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("arm") }),
  z.object({ action: z.literal("release"), userId: z.string().uuid() }),
]);

export async function POST(request: Request): Promise<Response> {
  if (process.env.NODE_ENV !== "development" || process.env.PLAYWRIGHT_TEST !== "true") {
    return new Response(null, { status: 404 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ message: "El cuerpo debe ser JSON válido." }, { status: 400 });
  }

  const parsed = barrierRequestSchema.safeParse(body);
  if (!parsed.success) {
    return Response.json({ message: "Solicitud de barrera no válida." }, { status: 400 });
  }

  if (parsed.data.action === "arm") {
    armE2EAvatarWrite();
    return new Response(null, { status: 204 });
  }

  return releaseE2EAvatarWrite(parsed.data.userId)
    ? new Response(null, { status: 204 })
    : Response.json(
        { message: "No hay ninguna subida E2E bloqueada para esa cuenta." },
        { status: 409 },
      );
}
