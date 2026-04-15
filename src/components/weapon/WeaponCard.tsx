import { Link } from "react-router-dom";
import type { Weapon } from "../../core/models/types";
import styles from "./WeaponCard.module.css";

interface WeaponCardProps {
  weapon: Weapon;
  imageUrl?: string;
}

export function WeaponCard({ weapon, imageUrl }: WeaponCardProps) {
  return (
    <Link to={`/weapons/${weapon.id}`} className={styles.card}>
      <div className={styles.imageArea}>
        {imageUrl ? (
          <img src={imageUrl} alt={weapon.name} className={styles.image} />
        ) : (
          <div className={styles.placeholder} aria-label={weapon.name}>
            {weapon.name.charAt(0)}
          </div>
        )}
      </div>
      <div className={styles.info}>
        <span className={styles.name}>{weapon.name}</span>
        <span className={styles.rarity}>★{weapon.rarity}</span>
        {weapon.category && <span className={styles.category}>{weapon.category}</span>}
      </div>
    </Link>
  );
}
