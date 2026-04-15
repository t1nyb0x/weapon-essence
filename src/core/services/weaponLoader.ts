import type { Skill, Weapon } from "../models/types";

const SKILLS_FILE = "/weapons/skills.json" as const;

const WEAPON_CATEGORY_FILES = [
  "/weapons/sword.json",
  "/weapons/greatsword.json",
  "/weapons/handcannon.json",
  "/weapons/polearm.json",
  "/weapons/arts-unit.json",
] as const;

interface RawWeapon {
  id: string;
  name: string;
  rarity: number;
  category?: string;
  description?: string;
  skills: number[];
}

function isValidSkill(entry: unknown): entry is Skill {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  if (!Number.isInteger(e["id"]) || (e["id"] as number) < 1) return false;
  if (typeof e["name"] !== "string" || e["name"].length === 0) return false;
  if (typeof e["description"] !== "string") return false;
  return true;
}

function isValidRawWeapon(entry: unknown): entry is RawWeapon {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  if (typeof e["id"] !== "string" || e["id"].length === 0) return false;
  if (typeof e["name"] !== "string" || e["name"].length === 0) return false;
  if (!Number.isInteger(e["rarity"]) || (e["rarity"] as number) < 1)
    return false;
  if (!Array.isArray(e["skills"])) return false;
  return true;
}

async function fetchSkills(): Promise<Map<number, Skill>> {
  const response = await fetch(SKILLS_FILE);
  if (!response.ok) {
    throw new Error(
      `${SKILLS_FILE} の読み込みに失敗しました: ${response.status}`,
    );
  }
  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) {
    throw new Error(`${SKILLS_FILE} の形式が不正です`);
  }
  const map = new Map<number, Skill>();
  for (const entry of raw) {
    if (isValidSkill(entry)) {
      map.set(entry.id, entry);
    } else {
      console.warn("不正なスキルエントリを除外しました:", entry);
    }
  }
  return map;
}

async function fetchCategory(
  path: string,
  skillMap: Map<number, Skill>,
): Promise<Weapon[]> {
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
      const skills = entry.skills
        .map((id) => skillMap.get(id))
        .filter((s): s is Skill => s !== undefined);
      weapons.push({ ...entry, skills });
    } else {
      console.warn("不正な武器エントリを除外しました:", entry);
    }
  }
  return weapons;
}

export async function weaponLoader(): Promise<Weapon[]> {
  const skillMap = await fetchSkills();
  const results = await Promise.all(
    WEAPON_CATEGORY_FILES.map((path) => fetchCategory(path, skillMap)),
  );
  return results.flat();
}
