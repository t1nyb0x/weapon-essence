import { describe, it, expect, beforeEach, vi } from "vitest";
import "fake-indexeddb/auto";
import {
  IndexedDbImageStorage,
  resetDbForTesting,
} from "../../../src/adapters/indexeddb/IndexedDbImageStorage";
import type { UserWeaponImage } from "../../../src/core/models/types";

function makeImage(weaponId: string): UserWeaponImage {
  return {
    weaponId,
    blob: new Blob(["data"], { type: "image/png" }),
    fileName: "test.png",
    mimeType: "image/png",
    updatedAt: new Date(),
  };
}

beforeEach(() => {
  resetDbForTesting();
});

describe("IndexedDbImageStorage", () => {
  it("saveImage で保存し getImage で取得できる", async () => {
    const storage = new IndexedDbImageStorage();
    const image = makeImage("weapon-001");
    await storage.saveImage(image);
    const result = await storage.getImage("weapon-001");
    expect(result).toBeDefined();
    expect(result?.weaponId).toBe("weapon-001");
  });

  it("deleteImage で削除すると getImage が undefined を返す", async () => {
    const storage = new IndexedDbImageStorage();
    await storage.saveImage(makeImage("weapon-002"));
    await storage.deleteImage("weapon-002");
    const result = await storage.getImage("weapon-002");
    expect(result).toBeUndefined();
  });

  it("存在しない weaponId は undefined を返す", async () => {
    const storage = new IndexedDbImageStorage();
    const result = await storage.getImage("non-existent");
    expect(result).toBeUndefined();
  });

  it("再設定時に旧画像が削除され新画像が保存される", async () => {
    const storage = new IndexedDbImageStorage();
    const first = makeImage("weapon-003");
    await storage.saveImage(first);

    const second: UserWeaponImage = {
      weaponId: "weapon-003",
      blob: new Blob(["new"], { type: "image/webp" }),
      fileName: "new.webp",
      mimeType: "image/webp",
      updatedAt: new Date(),
    };
    await storage.saveImage(second);

    const result = await storage.getImage("weapon-003");
    expect(result?.mimeType).toBe("image/webp");
  });

  it("IndexedDB 未対応環境では getImage が undefined を返す（no-op）", async () => {
    vi.stubGlobal("indexedDB", undefined);
    resetDbForTesting();
    const storage = new IndexedDbImageStorage();
    const result = await storage.getImage("weapon-004");
    expect(result).toBeUndefined();
    vi.unstubAllGlobals();
  });

  it("IndexedDB 未対応環境では saveImage / deleteImage が no-op になる", async () => {
    vi.stubGlobal("indexedDB", undefined);
    resetDbForTesting();
    const storage = new IndexedDbImageStorage();
    await expect(
      storage.saveImage(makeImage("weapon-005")),
    ).resolves.toBeUndefined();
    await expect(storage.deleteImage("weapon-005")).resolves.toBeUndefined();
    vi.unstubAllGlobals();
  });
});
