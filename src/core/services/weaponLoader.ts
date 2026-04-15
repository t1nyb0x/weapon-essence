import type { Weapon } from "../models/types";

function isValidWeapon(entry: unknown): entry is Weapon {
  if (typeof entry !== "object" || entry === null) return false;
  const e = entry as Record<string, unknown>;
  if (typeof e["id"] !== "string" || e["id"].length === 0) return false;
  if (typeof e["name"] !== "string" || e["name"].length === 0) return false;
  if (!Number.isInteger(e["rarity"]) || (e["rarity"] as number) < 1) return false;
  if (!Array.isArray(e["skills"])) return false;
  return true;
}

export async function weaponLoader(): Promise<Weapon[]> {
  const response = await fetch("/weapons.json");
  if (!response.ok) {
    throw new Error(`weapons.json の読み込みに失敗しました: ${response.status}`);
  }
  const raw: unknown = await response.json();
  if (!Array.isArray(raw)) {
    throw new Error("weapons.json の形式が不正です");
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
