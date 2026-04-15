import { describe, it, expect, vi, beforeEach } from "vitest";
import { weaponLoader } from "../../../src/core/services/weaponLoader";
import type { Weapon } from "../../../src/core/models/types";

const NUM_CATEGORIES = 5;

// weaponLoader は5ファイルを並列フェッチするため、全ファイル分のモックを設定する
function mockAllFetchesOk(payloads: unknown[]) {
  const spy = vi.spyOn(global, "fetch");
  for (const payload of payloads) {
    spy.mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    } as Response);
  }
}

// 5ファイル全て同じ内容で返すヘルパー
function mockAllFetchesWith(body: unknown) {
  mockAllFetchesOk(Array(NUM_CATEGORIES).fill(body));
}

function mockFirstFetchFail(status = 500) {
  vi.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: false,
    status,
  } as Response);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("weaponLoader", () => {
  it("各カテゴリファイルの正常データを結合して全件取得する", async () => {
    const swordWeapon: Weapon = {
      id: "sword-001",
      name: "テストソード",
      rarity: 5,
      category: "sword",
      skills: [{ name: "斬撃", description: "鋭い斬撃を放つ" }],
    };
    const gsWeapon: Weapon = {
      id: "greatsword-001",
      name: "テスト大剣",
      rarity: 4,
      category: "greatsword",
      skills: [],
    };
    mockAllFetchesOk([
      [swordWeapon],
      [gsWeapon],
      [],
      [],
      [],
    ]);
    const result = await weaponLoader();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("sword-001");
    expect(result[1].id).toBe("greatsword-001");
  });

  it("いずれかのファイルで fetch が失敗した場合は throw する", async () => {
    mockFirstFetchFail(500);
    await expect(weaponLoader()).rejects.toThrow();
  });

  it("JSON 全体が配列でない場合は throw する", async () => {
    mockAllFetchesWith({ invalid: true });
    await expect(weaponLoader()).rejects.toThrow();
  });

  it("不正エントリを除外し、正常エントリは表示継続する", async () => {
    const validWeapon: Weapon = { id: "sword-001", name: "正常", rarity: 5, skills: [] };
    const invalidEntries = [
      { id: "", name: "不正", rarity: 5, skills: [] },
      { id: "x", name: "不正rarity", rarity: 0, skills: [] },
    ];
    mockAllFetchesOk([
      [validWeapon, ...invalidEntries],
      [],
      [],
      [],
      [],
    ]);
    const result = await weaponLoader();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sword-001");
  });

  it("全カテゴリが0件でも throw しない", async () => {
    mockAllFetchesWith([]);
    const result = await weaponLoader();
    expect(result).toHaveLength(0);
  });

  it("skills が空配列の武器も正常に返す", async () => {
    const data = [{ id: "w-no-skill", name: "スキルなし", rarity: 1, skills: [] }];
    mockAllFetchesOk([data, [], [], [], []]);
    const result = await weaponLoader();
    expect(result).toHaveLength(1);
    expect(result[0].skills).toEqual([]);
  });
});
