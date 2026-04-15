import { describe, it, expect, vi, beforeEach } from "vitest";
import { weaponLoader } from "../../../src/core/services/weaponLoader";
import type { Weapon } from "../../../src/core/models/types";

const validWeapons: Weapon[] = [
  {
    id: "w-001",
    name: "テストソード",
    rarity: 5,
    category: "sword",
    skills: [{ name: "斬撃", description: "鋭い斬撃を放つ" }],
  },
  {
    id: "w-002",
    name: "スキルなしの剣",
    rarity: 3,
    skills: [],
  },
];

function mockFetchOk(body: unknown) {
  vi.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: true,
    json: async () => body,
  } as Response);
}

function mockFetchFail(status = 404) {
  vi.spyOn(global, "fetch").mockResolvedValueOnce({
    ok: false,
    status,
  } as Response);
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("weaponLoader", () => {
  it("正常データを全件取得する", async () => {
    mockFetchOk(validWeapons);
    const result = await weaponLoader();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("w-001");
    expect(result[1].skills).toHaveLength(0);
  });

  it("fetch が失敗した場合は throw する", async () => {
    mockFetchFail(500);
    await expect(weaponLoader()).rejects.toThrow();
  });

  it("JSON 全体が配列でない場合は throw する", async () => {
    mockFetchOk({ invalid: true });
    await expect(weaponLoader()).rejects.toThrow();
  });

  it("不正エントリを除外し、正常エントリは表示継続する", async () => {
    const data = [
      ...validWeapons,
      { id: "", name: "不正", rarity: 5, skills: [] },
      { id: "w-003", name: "不正rarity", rarity: 0, skills: [] },
    ];
    mockFetchOk(data);
    const result = await weaponLoader();
    expect(result).toHaveLength(2);
    expect(result.every((w) => w.id.length > 0)).toBe(true);
  });

  it("武器が0件でも throw しない", async () => {
    mockFetchOk([]);
    const result = await weaponLoader();
    expect(result).toHaveLength(0);
  });

  it("skills が空配列の武器も正常に返す", async () => {
    const data = [{ id: "w-no-skill", name: "スキルなし", rarity: 1, skills: [] }];
    mockFetchOk(data);
    const result = await weaponLoader();
    expect(result).toHaveLength(1);
    expect(result[0].skills).toEqual([]);
  });
});
