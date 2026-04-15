import { ALLOWED_MIME_TYPES } from "../constants";

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export interface Skill {
  id: number;
  name: string;
  description: string;
}

export interface Weapon {
  id: string;
  name: string;
  rarity: number;
  category?: string;
  description?: string;
  skills: Skill[];
}

export interface UserWeaponImage {
  weaponId: string;
  blob: Blob;
  fileName: string;
  mimeType: AllowedMimeType;
  updatedAt: Date;
}
