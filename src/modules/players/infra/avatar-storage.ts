import { getCloudflareContext } from "@opennextjs/cloudflare";
import { AppError } from "@/lib/errors";

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
    value: ArrayBuffer,
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
const IMAGES_INVALID_INPUT_CODE = 9412;
const LOCAL_IMAGES_INVALID_INPUT_CODE = 9523;
const LOCAL_IMAGES_CORRUPT_IMAGE_MESSAGE = "Input buffer has corrupt header";

function avatarKey(userId: string): string {
  return `${AVATAR_KEY_PREFIX}${userId}.webp`;
}

export async function transformAvatar(source: Uint8Array): Promise<ArrayBuffer> {
  if (source.byteLength === 0 || source.byteLength > MAX_AVATAR_BYTES) {
    throw new Error("El archivo debe ocupar como máximo 2 MB.");
  }

  const { env } = await getCloudflareContext({ async: true });
  let transformed: Awaited<ReturnType<ReturnType<typeof env.IMAGES.input>["output"]>>;
  try {
    transformed = await env.IMAGES.input(source)
      .transform({ width: 512, height: 512, fit: "cover" })
      .output({ format: "image/webp", anim: false });
  } catch (error: unknown) {
    if (isInvalidImageInputError(error)) {
      throw new AppError("El archivo no contiene una imagen válida.", "VALIDATION");
    }
    throw error;
  }
  const response = await transformed.response();
  if (!response.ok) {
    if (response.status === 415) {
      await response.body?.cancel();
      throw new AppError("El archivo no contiene una imagen compatible.", "VALIDATION");
    }
    throw new Error("No se pudo procesar la imagen.");
  }

  return response.arrayBuffer();
}

export async function saveAvatar(
  userId: string,
  transformedImage: ArrayBuffer,
): Promise<string> {
  const { env } = await getCloudflareContext({ async: true });
  await env.AVATARS.put(avatarKey(userId), transformedImage, {
    httpMetadata: { contentType: "image/webp", cacheControl: "public, max-age=3600" },
  });
  return `/api/players/${encodeURIComponent(userId)}/avatar?v=${crypto.randomUUID()}`;
}

export function isInvalidImageInputError(error: unknown): boolean {
  if (typeof error !== "object" || error === null || !("code" in error)) return false;
  if (error.code === IMAGES_INVALID_INPUT_CODE) return true;
  return (
    error.code === LOCAL_IMAGES_INVALID_INPUT_CODE &&
    "message" in error &&
    typeof error.message === "string" &&
    error.message.includes(LOCAL_IMAGES_CORRUPT_IMAGE_MESSAGE)
  );
}

export async function getAvatar(userId: string): Promise<AvatarObject | null> {
  const { env } = await getCloudflareContext({ async: true });
  return env.AVATARS.get(avatarKey(userId));
}

export async function deleteAvatar(userId: string): Promise<void> {
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
