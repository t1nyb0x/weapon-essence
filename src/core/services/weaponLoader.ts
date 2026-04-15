import type { Weapon } from "../models/types";

const WEAPON_CATEGORY_FILES = [
  "/weapons/sword.json",
  "/weapons/greatsword.json",
  "/weapons/handcannon.json",
  "/weapons/polearm.json",
  "/weapons/arts-unit.json",
] as const;

function isValidWeapon(entry: unknown): entry is Weapon {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  if (typeof e["id"] !== "string" || e["id"].length === 0) return false;
  if (typeof e["name"] !== "string" || e["name"].length === 0) return false;
  if (!Number.isInteger(e["rarity"]) || (e["rarity"] as number) < 1) return false;
  if (!Array.isArray(e["skills"])) return false;
  return true;
}

async function fetchCategory(path: string): Promise<Weapon[]> {
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
    if (isValidWeapon(entry)) {
      weapons.push(entry);
    } else {
      console.warn("不正な武器エントリを除外しました:", entry);
    }
  }
  return weapons;
}

export async function weaponLoader(): Promise<Weapon[]> {
  const results = await Promise.all(WEAPON_CATEGORY_FILES.map(fetchCategory));
  return results.flat();
}
