import { useRef, useState } from "react";
import { validateImage } from "../../core/services/imageValidator";
import styles from "./WeaponImageUploader.module.css";

interface WeaponImageUploaderProps {
  hasImage: boolean;
  onSave: (file: File) => void;
  onDelete: () => void;
}

export function WeaponImageUploader({
  hasImage,
  onSave,
  onDelete,
}: WeaponImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    const result = validateImage(file);
    if (!result.ok) {
      setErrorMessage(result.message);
      event.target.value = "";
      return;
    }
    setErrorMessage(null);
    onSave(file);
  }

  return (
    <div className={styles.container}>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        onChange={handleFileChange}
        className={styles.hiddenInput}
        aria-label="画像ファイルを選択"
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className={styles.uploadButton}
      >
        画像を設定
      </button>
      {hasImage && (
        <button type="button" onClick={onDelete} className={styles.deleteButton}>
          画像を削除
        </button>
      )}
      {errorMessage && (
        <p role="alert" className={styles.error}>
          {errorMessage}
        </p>
      )}
    </div>
  );
}
