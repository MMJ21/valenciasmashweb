import { AuthConfigurationError, getAuth } from "@/modules/auth";

async function handleAuthRequest(request: Request): Promise<Response> {
  try {
    const auth = await getAuth();
    return auth.handler(request);
  } catch (error: unknown) {
    if (error instanceof AuthConfigurationError) {
      return Response.json({ message: error.message }, { status: 503 });
    }
    throw error;
  }
}

export function GET(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}

export function POST(request: Request): Promise<Response> {
  return handleAuthRequest(request);
}
