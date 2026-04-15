import type { Weapon } from "../../core/models/types";
import { WeaponCard } from "./WeaponCard";
import { EmptyState } from "../ui/EmptyState";
import styles from "./WeaponList.module.css";

interface WeaponListProps {
  weapons: Weapon[];
}

export function WeaponList({ weapons }: WeaponListProps) {
  if (weapons.length === 0) {
    return <EmptyState message="武器データが見つかりません" />;
  }
  return (
    <ul className={styles.list}>
      {weapons.map((weapon) => (
        <li key={weapon.uid} className={styles.item}>
          <WeaponCard weapon={weapon} />
        </li>
      ))}
    </ul>
  );
}
