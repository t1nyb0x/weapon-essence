import { ALLOWED_MIME_TYPES } from "../constants";

export type AllowedMimeType = (typeof ALLOWED_MIME_TYPES)[number];

export type SkillType = "base" | "additional" | "skill";

export interface SkillRef {
  type: SkillType;
  id: number;
}

export interface Skill {
  id: number;
  type: SkillType;
  name: string;
  description: string;
}

export type WeaponCategory =
  | "sword"
  | "greatsword"
  | "handcannon"
  | "polearm"
  | "arts-unit";

export interface RawWeapon {
  id: string;
  name: string;
  rarity: number;
  description?: string;
  effectRefs: SkillRef[];
}

export type Weapon = Omit<RawWeapon, "effectRefs"> & {
  category: WeaponCategory;
  uid: string;
  skills: Skill[];
};

export interface UserWeaponImage {
  weaponId: string;
  blob: Blob;
  fileName: string;
  mimeType: AllowedMimeType;
  updatedAt: Date;
}
