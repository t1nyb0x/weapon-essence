import { openDB, type IDBPDatabase } from "idb";
import {
  WEAPON_IMAGE_DB_NAME,
  WEAPON_IMAGE_DB_VERSION,
  WEAPON_IMAGE_STORE_NAME,
} from "../../core/constants";
import type { IImageStorage } from "../../core/ports/IImageStorage";
import type { UserWeaponImage } from "../../core/models/types";

let dbPromise: Promise<IDBPDatabase> | null = null;

function getDb(): Promise<IDBPDatabase> | null {
  if (typeof window === "undefined" || !window.indexedDB) return null;
  if (!dbPromise) {
    dbPromise = openDB(WEAPON_IMAGE_DB_NAME, WEAPON_IMAGE_DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains(WEAPON_IMAGE_STORE_NAME)) {
          db.createObjectStore(WEAPON_IMAGE_STORE_NAME, {
            keyPath: "weaponId",
          });
        }
      },
    });
  }
  return dbPromise;
}

export class IndexedDbImageStorage implements IImageStorage {
  async getImage(weaponId: string): Promise<UserWeaponImage | undefined> {
    const db = getDb();
    if (!db) return undefined;
    return (await db).get(WEAPON_IMAGE_STORE_NAME, weaponId) as Promise<
      UserWeaponImage | undefined
    >;
  }

  async saveImage(image: UserWeaponImage): Promise<void> {
    const db = getDb();
    if (!db) return;
    const store = await db;
    await store.delete(WEAPON_IMAGE_STORE_NAME, image.weaponId);
    await store.put(WEAPON_IMAGE_STORE_NAME, image);
  }

  async deleteImage(weaponId: string): Promise<void> {
    const db = getDb();
    if (!db) return;
    await (await db).delete(WEAPON_IMAGE_STORE_NAME, weaponId);
  }
}

export function resetDbForTesting(): void {
  dbPromise = null;
}
