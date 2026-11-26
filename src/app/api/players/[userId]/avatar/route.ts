import { getAvatar } from "@/modules/players";

interface AvatarRouteContext {
  readonly params: Promise<{ readonly userId: string }>;
}

export async function GET(_request: Request, context: AvatarRouteContext): Promise<Response> {
  const { userId } = await context.params;
  const object = await getAvatar(userId);
  if (object === null) {
    return new Response(null, { status: 404 });
  }
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("Content-Type", "image/webp");
  headers.set("Cache-Control", "public, max-age=31536000, immutable");
  headers.set("ETag", object.httpEtag);
  return new Response(object.body, { headers });
}
