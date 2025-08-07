// lib/utils.ts
import crypto from "crypto";

export function generateBeneficiaryId(): string {
  return `bf_${crypto.randomBytes(10).toString("hex")}`; // 20-char hex
}
