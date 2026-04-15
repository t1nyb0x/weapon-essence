import { useState } from "react";
import { useLoaderData } from "react-router-dom";
import type { Weapon } from "../core/models/types";
import { WeaponList } from "../components/weapon/WeaponList";
import { EmptyState } from "../components/ui/EmptyState";
import { weaponFilter } from "../core/services/weaponFilter";
import styles from "./WeaponsPage.module.css";

export function WeaponsPage() {
  const weapons = useLoaderData() as Weapon[];
  const [nameQuery, setNameQuery] = useState("");
  const [category, setCategory] = useState<string | undefined>(undefined);
  const [rarity, setRarity] = useState<number | undefined>(undefined);

  const categories = [
    ...new Set(weapons.map((w) => w.category).filter((c): c is string => !!c)),
  ].sort();
  const rarities = [...new Set(weapons.map((w) => w.rarity))].sort((a, b) => a - b);

  const filtered = weaponFilter(weapons, { nameQuery, category, rarity });

  function getEmptyMessage(): string {
    if (nameQuery) return `"${nameQuery}" を含む武器はありません`;
    return "条件に一致する武器はありません";
  }

  return (
    <main className={styles.page}>
      <h1 className={styles.heading}>武器一覧</h1>
      <div className={styles.controls}>
        <input
          type="search"
          placeholder="武器名で検索…"
          value={nameQuery}
          onChange={(e) => setNameQuery(e.target.value)}
          className={styles.searchInput}
          aria-label="武器名で検索"
        />
        <select
          value={category ?? ""}
          onChange={(e) => setCategory(e.target.value || undefined)}
          className={styles.select}
          aria-label="カテゴリで絞り込み"
        >
          <option value="">カテゴリ（すべて）</option>
          {categories.map((c) => (
            <option key={c} value={c}>
              {c}
            </option>
          ))}
        </select>
        <select
          value={rarity ?? ""}
          onChange={(e) => setRarity(e.target.value ? Number(e.target.value) : undefined)}
          className={styles.select}
          aria-label="レアリティで絞り込み"
        >
          <option value="">レアリティ（すべて）</option>
          {rarities.map((r) => (
            <option key={r} value={r}>
              ★{r}
            </option>
          ))}
        </select>
      </div>
      {filtered.length === 0 && (nameQuery || category || rarity) ? (
        <EmptyState message={getEmptyMessage()} />
      ) : (
        <WeaponList weapons={filtered} />
      )}
    </main>
  );
}
