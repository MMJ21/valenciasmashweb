const ITERATIONS = 100_000;
const WORKER_MAX_ITERATIONS = 100_000;
const LEGACY_LOCAL_MAX_ITERATIONS = 600_000;
const KEY_LENGTH_BITS = 256;
const SALT_LENGTH_BYTES = 16;
const PREFIX = "pbkdf2-sha256";
const encoder = new TextEncoder();

function encodeBase64Url(value: Uint8Array): string {
  let binary = "";
  for (const byte of value) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary).replaceAll("+", "-").replaceAll("/", "_").replaceAll("=", "");
}

function decodeBase64Url(value: string): Uint8Array<ArrayBuffer> | undefined {
  try {
    const base64 = value.replaceAll("-", "+").replaceAll("_", "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    return Uint8Array.from(atob(padded), (character) => character.charCodeAt(0));
  } catch {
    return undefined;
  }
}

async function deriveKey(
  password: string,
  salt: Uint8Array<ArrayBuffer>,
  iterations: number,
): Promise<Uint8Array<ArrayBuffer>> {
  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"],
  );
  const derivedBits = await crypto.subtle.deriveBits(
    { name: "PBKDF2", hash: "SHA-256", salt, iterations },
    keyMaterial,
    KEY_LENGTH_BITS,
  );
  return new Uint8Array(derivedBits);
}

/** Hashes passwords with a salted, versioned PBKDF2-SHA-256 encoding. */
export async function hashPassword(password: string): Promise<string> {
  const salt = crypto.getRandomValues(new Uint8Array(SALT_LENGTH_BYTES));
  const derivedKey = await deriveKey(password, salt, ITERATIONS);
  return `${PREFIX}$${ITERATIONS}$${encodeBase64Url(salt)}$${encodeBase64Url(derivedKey)}`;
}

/** Verifies an encoded password hash without early-exit byte comparisons. */
export async function verifyPasswordHash(input: {
  readonly hash: string;
  readonly password: string;
}): Promise<boolean> {
  const [prefix, iterationsText, saltText, expectedText, ...extra] = input.hash.split("$");
  const iterations = Number(iterationsText);
  const maxIterations =
    process.env.NODE_ENV === "development" ? LEGACY_LOCAL_MAX_ITERATIONS : WORKER_MAX_ITERATIONS;
  if (
    prefix !== PREFIX ||
    extra.length > 0 ||
    !Number.isSafeInteger(iterations) ||
    iterations < 100_000 ||
    iterations > maxIterations ||
    saltText === undefined ||
    expectedText === undefined
  ) {
    return false;
  }

  const salt = decodeBase64Url(saltText);
  const expected = decodeBase64Url(expectedText);
  if (salt === undefined || expected === undefined || salt.length < 16 || expected.length !== 32) {
    return false;
  }

  const actual = await deriveKey(input.password, salt, iterations);
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= (expected[index] ?? 0) ^ (actual[index] ?? 0);
  }
  return difference === 0;
}
