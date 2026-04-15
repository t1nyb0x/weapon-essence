import type {
  RawWeapon,
  Skill,
  SkillRef,
  Weapon,
  WeaponCategory,
} from "../models/types";

const EFFECT_FILES = [
  "/effects/base-effects.json",
  "/effects/additional-effects.json",
  "/effects/skill-effects.json",
] as const;

const WEAPON_CATEGORIES: WeaponCategory[] = [
  "sword",
  "greatsword",
  "handcannon",
  "polearm",
  "arts-unit",
];

function isValidSkill(entry: unknown): entry is Skill {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  if (!Number.isInteger(e["id"]) || (e["id"] as number) < 1) return false;
  if (
    e["type"] !== "base" &&
    e["type"] !== "additional" &&
    e["type"] !== "skill"
  )
    return false;
  if (typeof e["name"] !== "string" || e["name"].length === 0) return false;
  if (typeof e["description"] !== "string") return false;
  return true;
}

function isValidSkillRef(ref: unknown): ref is SkillRef {
  if (typeof ref !== "object" || ref === null) return false;
  const r = ref as Record<string, unknown>;
  if (
    r["type"] !== "base" &&
    r["type"] !== "additional" &&
    r["type"] !== "skill"
  )
    return false;
  if (!Number.isInteger(r["id"]) || (r["id"] as number) < 1) return false;
  return true;
}

function isValidRawWeapon(entry: unknown): entry is RawWeapon {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  if (typeof e["id"] !== "string" || e["id"].length === 0) return false;
  if (typeof e["name"] !== "string" || e["name"].length === 0) return false;
  if (!Number.isInteger(e["rarity"]) || (e["rarity"] as number) < 1)
    return false;
  if (!Array.isArray(e["effectRefs"])) return false;
  if (!(e["effectRefs"] as unknown[]).every(isValidSkillRef)) return false;
  return true;
}

async function fetchSkills(): Promise<Map<string, Skill>> {
  const results = await Promise.all(
    EFFECT_FILES.map(async (path) => {
      const response = await fetch(path);
      if (!response.ok) {
        throw new Error(`${path} の読み込みに失敗しました: ${response.status}`);
      }
      const raw: unknown = await response.json();
      if (!Array.isArray(raw)) {
        throw new Error(`${path} の形式が不正です`);
      }
      return raw;
    }),
  );
  const map = new Map<string, Skill>();
  for (const entries of results) {
    for (const entry of entries) {
      if (isValidSkill(entry)) {
        map.set(`${entry.type}:${entry.id}`, entry);
      } else {
        console.warn("不正なスキルエントリを除外しました:", entry);
      }
    }
  }
  return map;
}

async function fetchCategory(
  category: WeaponCategory,
  skillMap: Map<string, Skill>,
): Promise<Weapon[]> {
  const path = `/weapons/${category}.json`;
  const response = await fetch(path);
  if (!response.ok) {
    throw new Error(`${path} の読み込みに失敗しました: ${response.status}`);
  }
  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) {
    throw new Error(`${path} の形式が不正です`);
  }
  const weapons: Weapon[] = [];
  for (const entry of raw) {
    if (isValidRawWeapon(entry)) {
      const { effectRefs, ...weaponData } = entry;
      const skills = effectRefs
        .map((ref) => skillMap.get(`${ref.type}:${ref.id}`))
        .filter((s): s is Skill => s !== undefined);
      weapons.push({
        ...weaponData,
        category,
        uid: entry.id,
        skills,
      });
    } else {
      console.warn("不正な武器エントリを除外しました:", entry);
    }
  }
  return weapons;
}

export async function weaponLoader(): Promise<Weapon[]> {
  const skillMap = await fetchSkills();
  const results = await Promise.all(
    WEAPON_CATEGORIES.map((category) => fetchCategory(category, skillMap)),
  );
  return results.flat();
}
