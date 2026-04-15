import { describe, it, expect, vi, beforeEach } from "vitest";
import { weaponLoader } from "../../../src/core/services/weaponLoader";
import type { Skill, Weapon } from "../../../src/core/models/types";

const NUM_CATEGORIES = 5;
const NUM_EFFECT_FILES = 3;
// effectファイル3 + weaponファイル5 = 合計8フェッチ
const NUM_TOTAL_FETCHES = NUM_EFFECT_FILES + NUM_CATEGORIES;

const EMPTY_EFFECTS = [[], [], []]; // base / additional / skill

// effectファイル3つ + weaponファイル分のモックを設定する
function mockAllFetchesOk(
  effectPayloads: unknown[][],
  weaponPayloads: unknown[],
) {
  const spy = vi.spyOn(global, "fetch");
  for (const payload of effectPayloads) {
    spy.mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    } as Response);
  }
  for (const payload of weaponPayloads) {
    spy.mockResolvedValueOnce({
      ok: true,
      json: async () => payload,
    } as Response);
  }
}

// weaponファイルを全て同じ内容、effectファイルを空で返すヘルパー
function mockAllFetchesWith(weaponBody: unknown) {
  mockAllFetchesOk(EMPTY_EFFECTS, Array(NUM_CATEGORIES).fill(weaponBody));
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
    const skill: Skill = {
      id: 1,
      type: "skill",
      name: "斬撃",
      description: "鋭い斬撃を放つ",
    };
    const swordWeapon = {
      id: 1,
      name: "テストソード",
      rarity: 5,
      category: "sword",
      skills: [{ type: "skill", id: 1 }],
    };
    const gsWeapon = {
      id: 1,
      name: "テスト大剣",
      rarity: 4,
      category: "greatsword",
      skills: [],
    };
    mockAllFetchesOk(
      [[skill], [], []],
      [[swordWeapon], [gsWeapon], [], [], []],
    );
    const result = await weaponLoader();
    expect(result).toHaveLength(2);
    expect(result[0].id).toBe("sword-1");
    expect(result[0].skills).toEqual([skill]);
    expect(result[1].id).toBe("greatsword-1");
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
    const validWeapon = {
      id: 1,
      name: "正常",
      rarity: 5,
      category: "sword",
      skills: [],
    };
    const invalidEntries = [
      { id: 0, name: "不正id", rarity: 5, category: "sword", skills: [] },
      { id: 1, name: "カテゴリなし", rarity: 5, skills: [] },
      { id: 1, name: "不正rarity", rarity: 0, category: "sword", skills: [] },
    ];
    mockAllFetchesOk(EMPTY_EFFECTS, [
      [validWeapon, ...invalidEntries],
      [],
      [],
      [],
      [],
    ]);
    const result = await weaponLoader();
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("sword-1");
  });

  it("全カテゴリが0件でも throw しない", async () => {
    mockAllFetchesWith([]);
    const result = await weaponLoader();
    expect(result).toHaveLength(0);
  });

  it("skills が空配列の武器も正常に返す", async () => {
    const data = [
      { id: 1, name: "スキルなし", rarity: 1, category: "sword", skills: [] },
    ];
    mockAllFetchesOk(EMPTY_EFFECTS, [data, [], [], [], []]);
    const result = await weaponLoader();
    expect(result).toHaveLength(1);
    expect(result[0].skills).toEqual([]);
  });
});
