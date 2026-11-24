import { getAuth } from "@/modules/auth";
import { env } from "@/lib/config/env";

async function handleAuthRequest(request: Request): Promise<Response> {
  if (
    process.env.NODE_ENV === "production" &&
    (env.BETTER_AUTH_SECRET === undefined ||
      env.BETTER_AUTH_URL === undefined ||
      env.RESEND_API_KEY === undefined ||
      env.EMAIL_FROM === undefined)
  ) {
    return Response.json(
      { message: "La autenticación no está configurada en el servidor." },
      { status: 503 },
    );
  }

  const auth = await getAuth();
  return auth.handler(request);
}

export function GET(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}

export function POST(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}
