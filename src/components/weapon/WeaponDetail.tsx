import type { Weapon } from "../../core/models/types";
import { SkillList } from "./SkillList";
import styles from "./WeaponDetail.module.css";

interface WeaponDetailProps {
  weapon: Weapon;
  imageUrl?: string;
}

export function WeaponDetail({ weapon, imageUrl }: WeaponDetailProps) {
  return (
    <article className={styles.container}>
      <section className={styles.basicInfo}>
        <h2 className={styles.name}>{weapon.name}</h2>
        <div className={styles.meta}>
          <span className={styles.rarity}>★{weapon.rarity}</span>
          {weapon.category && (
            <span className={styles.category}>{weapon.category}</span>
          )}
        </div>
        {weapon.description && (
          <p className={styles.description}>{weapon.description}</p>
        )}
      </section>

      <section className={styles.skillSection}>
        <h3 className={styles.sectionTitle}>スキル一覧</h3>
        <SkillList skills={weapon.skills} />
      </section>

      {imageUrl && (
        <section className={styles.imageSection}>
          <h3 className={styles.sectionTitle}>設定画像</h3>
          <img
            src={imageUrl}
            alt={weapon.name}
            className={styles.weaponImage}
          />
        </section>
      )}
    </article>
  );
}
