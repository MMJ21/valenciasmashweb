import { getCloudflareContext } from "@opennextjs/cloudflare";

interface AvatarObject {
  readonly body: ReadableStream<Uint8Array>;
  readonly httpEtag: string;
  writeHttpMetadata(headers: Headers): void;
}

interface AvatarBucket {
  delete(key: string): Promise<void>;
  get(key: string): Promise<AvatarObject | null>;
  put(
    key: string,
    value: ReadableStream<Uint8Array>,
    options: {
      readonly httpMetadata: { readonly contentType: string; readonly cacheControl: string };
    },
  ): Promise<unknown>;
}

declare global {
  interface CloudflareEnv {
    AVATARS: AvatarBucket;
  }
}

const MAX_AVATAR_BYTES = 2 * 1024 * 1024;
const AVATAR_KEY_PREFIX = "avatars/";

function avatarKey(userId: string): string {
  return `${AVATAR_KEY_PREFIX}${userId}.webp`;
}

export async function saveAvatar(userId: string, source: Uint8Array): Promise<string> {
  if (source.byteLength === 0 || source.byteLength > MAX_AVATAR_BYTES) {
    throw new Error("El archivo debe ocupar como máximo 2 MB.");
  }

  const { env } = await getCloudflareContext({ async: true });
  const transformed = await env.IMAGES.input(source)
    .transform({ width: 512, height: 512, fit: "cover" })
    .output({ format: "image/webp", anim: false });
  const response = await transformed.response();
  if (!response.ok) {
    throw new Error("No se pudo procesar la imagen.");
  }

  await env.AVATARS.put(avatarKey(userId), response.body, {
    httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=3600" },
  });
  return `/api/players/${encodeURIComponent(userId)}/avatar?v=${crypto.randomUUID()}`;
}

export async function getAvatar(userId: string): Promise<AvatarObject | null> {
  const { env } = await getCloudflareContext({ async: true });
  return env.AVATARS.get(avatarKey(userId));
}

export async function deleteAvatar(userId: string): Promise<void> {
  if (process.env.NODE_ENV !== "production") return;
  const { env } = await getCloudflareContext({ async: true });
  await env.AVATARS.delete(avatarKey(userId));
}

export function isSupportedImage(bytes: Uint8Array): boolean {
  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
  const png =
    bytes[0] === 0x89 &&
    bytes[1] === 0x50 &&
    bytes[2] === 0x4e &&
    bytes[3] === 0x47 &&
    bytes[4] === 0x0d &&
    bytes[5] === 0x0a &&
    bytes[6] === 0x1a &&
    bytes[7] === 0x0a;
  const webp =
    bytes[0] === 0x52 &&
    bytes[1] === 0x49 &&
    bytes[2] === 0x46 &&
    bytes[3] === 0x46 &&
    bytes[8] === 0x57 &&
    bytes[9] === 0x45 &&
    bytes[10] === 0x42 &&
    bytes[11] === 0x50;
  return jpeg || png || webp;
}

export { MAX_AVATAR_BYTES };
