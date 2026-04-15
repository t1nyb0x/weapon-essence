import { useEffect, useState } from "react";
import { Link, useLoaderData, useParams } from "react-router-dom";
import type { Weapon, UserWeaponImage } from "../core/models/types";
import { WeaponDetail } from "../components/weapon/WeaponDetail";
import { NotFound } from "../components/ui/NotFound";
import { WeaponImageUploader } from "../components/image/WeaponImageUploader";
import type { IImageStorage } from "../core/ports/IImageStorage";
import styles from "./WeaponDetailPage.module.css";

interface WeaponDetailPageProps {
  imageStorage: IImageStorage;
}

export function WeaponDetailPage({ imageStorage }: WeaponDetailPageProps) {
  const weapons = useLoaderData() as Weapon[];
  const { weaponId } = useParams<{ weaponId: string }>();
  const [imageUrl, setImageUrl] = useState<string | undefined>(undefined);
  const [saveError, setSaveError] = useState<string | null>(null);

  const weapon = weapons.find((w) => w.id === weaponId);

  useEffect(() => {
    if (!weapon) return;
    let objectUrl: string | undefined;
    imageStorage.getImage(weapon.id).then((stored) => {
      if (stored) {
        objectUrl = URL.createObjectURL(stored.blob);
        setImageUrl(objectUrl);
      } else {
        setImageUrl(undefined);
      }
    });
    return () => {
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [weapon, imageStorage]);

  if (!weapon) {
    return <NotFound />;
  }

  async function handleSave(file: File) {
    if (!weapon) return;
    const image: UserWeaponImage = {
      weaponId: weapon.id,
      blob: file,
      fileName: file.name,
      mimeType: file.type as UserWeaponImage["mimeType"],
      updatedAt: new Date(),
    };
    try {
      await imageStorage.saveImage(image);
      const url = URL.createObjectURL(file);
      setImageUrl((prev) => {
        if (prev) URL.revokeObjectURL(prev);
        return url;
      });
      setSaveError(null);
    } catch {
      setSaveError("画像の保存に失敗しました。再度お試しください");
    }
  }

  async function handleDelete() {
    if (!weapon) return;
    await imageStorage.deleteImage(weapon.id);
    setImageUrl((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return undefined;
    });
  }

  return (
    <main className={styles.page}>
      <Link to="/weapons" className={styles.backLink}>
        ← 武器一覧に戻る
      </Link>
      <WeaponDetail weapon={weapon} imageUrl={imageUrl} />
      <section className={styles.uploaderSection}>
        <WeaponImageUploader
          hasImage={!!imageUrl}
          onSave={handleSave}
          onDelete={handleDelete}
        />
        {saveError && (
          <p role="alert" className={styles.saveError}>
            {saveError}
          </p>
        )}
      </section>
    </main>
  );
}
