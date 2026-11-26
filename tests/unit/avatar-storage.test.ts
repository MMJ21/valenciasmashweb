import { describe, expect, it } from "vitest";
import { isSupportedImage, MAX_AVATAR_BYTES } from "@/modules/players/infra/avatar-storage";

describe("validación de firmas de foto", () => {
  it("reconoce JPEG, PNG y WebP por sus bytes y no por el nombre del archivo", () => {
    expect(isSupportedImage(new Uint8Array([0xff, 0xd8, 0xff]))).toBe(true);
    expect(isSupportedImage(new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]))).toBe(
      true,
    );
    expect(
      isSupportedImage(
        new Uint8Array([0x52, 0x49, 0x46, 0x46, 0x00, 0x00, 0x00, 0x00, 0x57, 0x45, 0x42, 0x50]),
      ),
    ).toBe(true);
    expect(isSupportedImage(new TextEncoder().encode("<svg></svg>"))).toBe(false);
  });

  it("mantiene el límite de entrada en 2 MiB", () => {
    expect(MAX_AVATAR_BYTES).toBe(2 * 1024 * 1024);
  });
});
