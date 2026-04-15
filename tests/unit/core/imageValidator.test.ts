import { describe, it, expect } from "vitest";
import { validateImage } from "../../../src/core/services/imageValidator";
import { WEAPON_IMAGE_MAX_BYTES } from "../../../src/core/constants";

function makeFile(name: string, type: string, size: number): File {
  const blob = new Blob([new Uint8Array(size)], { type });
  return new File([blob], name, { type });
}

describe("validateImage", () => {
  it("PNG ファイルは通過する", () => {
    const file = makeFile("test.png", "image/png", 1024);
    expect(validateImage(file)).toEqual({ ok: true });
  });

  it("JPEG ファイルは通過する", () => {
    const file = makeFile("test.jpg", "image/jpeg", 1024);
    expect(validateImage(file)).toEqual({ ok: true });
  });

  it("WebP ファイルは通過する", () => {
    const file = makeFile("test.webp", "image/webp", 1024);
    expect(validateImage(file)).toEqual({ ok: true });
  });

  it("非対応 MIME タイプは拒否する", () => {
    const file = makeFile("test.gif", "image/gif", 1024);
    const result = validateImage(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("PNG・JPEG・WebP");
    }
  });

  it("5MB 以下のファイルは通過する", () => {
    const file = makeFile("test.png", "image/png", WEAPON_IMAGE_MAX_BYTES);
    expect(validateImage(file)).toEqual({ ok: true });
  });

  it("5MB 超過のファイルは拒否する", () => {
    const file = makeFile("test.png", "image/png", WEAPON_IMAGE_MAX_BYTES + 1);
    const result = validateImage(file);
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.message).toContain("5MB");
    }
  });
});
