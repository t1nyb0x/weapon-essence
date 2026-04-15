import { ALLOWED_MIME_TYPES, WEAPON_IMAGE_MAX_BYTES } from "../constants";
import type { AllowedMimeType } from "../models/types";

type ValidationResult = { ok: true } | { ok: false; message: string };

function isAllowedMimeType(mime: string): mime is AllowedMimeType {
  return (ALLOWED_MIME_TYPES as readonly string[]).includes(mime);
}

export function validateImage(file: File): ValidationResult {
  if (!isAllowedMimeType(file.type)) {
    return {
      ok: false,
      message: "PNG・JPEG・WebP 形式のファイルを選択してください",
    };
  }
  if (file.size > WEAPON_IMAGE_MAX_BYTES) {
    return { ok: false, message: "ファイルサイズは 5MB 以下にしてください" };
  }
  return { ok: true };
}
