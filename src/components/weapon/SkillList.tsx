import type { Skill } from "../../core/models/types";
import { EmptyState } from "../ui/EmptyState";
import styles from "./SkillList.module.css";

interface SkillListProps {
  skills: Skill[];
}

export function SkillList({ skills }: SkillListProps) {
  if (skills.length === 0) {
    return <EmptyState message="スキルなし" />;
  }
  return (
    <ul className={styles.list}>
      {skills.map((skill, index) => (
        <li key={index} className={styles.item}>
          <span className={styles.name}>{skill.name}</span>
          <p className={styles.description}>{skill.description}</p>
        </li>
      ))}
    </ul>
  );
}
