import type { UserWeaponImage } from "../models/types";

export interface IImageStorage {
  getImage(weaponId: string): Promise<UserWeaponImage | undefined>;
  saveImage(image: UserWeaponImage): Promise<void>;
  deleteImage(weaponId: string): Promise<void>;
}
