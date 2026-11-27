interface AvatarUploadBarrier {
  readonly promise: Promise<void>;
  readonly release: () => void;
}

interface AvatarBarrierGlobal {
  __valenciaSmashAvatarUploadBarriers?: Map<string, AvatarUploadBarrier>;
  __valenciaSmashAvatarUploadBarrierArmed?: boolean;
}

function getBarriers(): Map<string, AvatarUploadBarrier> {
  // Next compiles API routes separately; globalThis shares the E2E latch between bundles.
  const global = globalThis as typeof globalThis & AvatarBarrierGlobal;
  global.__valenciaSmashAvatarUploadBarriers ??= new Map();
  return global.__valenciaSmashAvatarUploadBarriers;
}

export function isPlaywrightE2E(): boolean {
  return process.env.NODE_ENV === "development" && process.env.PLAYWRIGHT_TEST === "true";
}

export async function waitForE2EAvatarWrite(userId: string): Promise<void> {
  const global = globalThis as typeof globalThis & AvatarBarrierGlobal;
  if (!isPlaywrightE2E() || global.__valenciaSmashAvatarUploadBarrierArmed !== true) return;
  global.__valenciaSmashAvatarUploadBarrierArmed = false;

  let releaseBarrier: (() => void) | undefined;
  const promise = new Promise<void>((resolve) => {
    releaseBarrier = resolve;
  });
  if (releaseBarrier === undefined) {
    throw new Error("No se pudo crear la barrera E2E para la subida del avatar.");
  }

  const barrier: AvatarUploadBarrier = { promise, release: releaseBarrier };
  getBarriers().set(userId, barrier);
  console.info(`[E2E avatar] writer ready ${userId}`);

  try {
    await promise;
  } finally {
    if (getBarriers().get(userId) === barrier) {
      getBarriers().delete(userId);
    }
  }
}

export function notifyE2EAccountDeletionStarted(userId: string): void {
  if (isPlaywrightE2E()) {
    console.info(`[E2E avatar] account deletion marked ${userId}`);
  }
}

export function notifyE2EAvatarReservationReleased(userId: string): void {
  if (isPlaywrightE2E()) {
    console.info(`[E2E avatar] reservation released ${userId}`);
  }
}

export function notifyE2EAccountDeletionCompleted(userId: string): void {
  if (isPlaywrightE2E()) {
    console.info(`[E2E avatar] account deletion completed ${userId}`);
  }
}

export function releaseE2EAvatarWrite(userId: string): boolean {
  if (!isPlaywrightE2E()) return false;
  const barrier = getBarriers().get(userId);
  if (barrier === undefined) return false;
  barrier.release();
  return true;
}

export function armE2EAvatarWrite(): void {
  if (isPlaywrightE2E()) {
    const global = globalThis as typeof globalThis & AvatarBarrierGlobal;
    global.__valenciaSmashAvatarUploadBarrierArmed = true;
  }
}
