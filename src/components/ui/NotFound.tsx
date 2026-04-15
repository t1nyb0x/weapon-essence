import { Link } from "react-router-dom";
import styles from "./NotFound.module.css";

export function NotFound() {
  return (
    <div className={styles.container}>
      <h2 className={styles.title}>武器が見つかりません</h2>
      <p className={styles.message}>
        指定された武器は存在しないか、削除された可能性がありますわ。
      </p>
      <Link to="/weapons" className={styles.link}>
        武器一覧に戻る
      </Link>
    </div>
  );
}
