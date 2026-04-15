import type { Weapon } from "../models/types";

interface FilterOptions {
  nameQuery: string;
  category: string | undefined;
  rarity: number | undefined;
}

export function weaponFilter(weapons: Weapon[], options: FilterOptions): Weapon[] {
  const { nameQuery, category, rarity } = options;
  return weapons.filter((weapon) => {
    if (nameQuery && !weapon.name.toLowerCase().includes(nameQuery.toLowerCase())) {
      return false;
    }
    if (category !== undefined && weapon.category !== category) {
      return false;
    }
    if (rarity !== undefined && weapon.rarity !== rarity) {
      return false;
    }
    return true;
  });
}
