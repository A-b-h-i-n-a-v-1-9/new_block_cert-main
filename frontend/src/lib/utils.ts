// src/lib/utils.ts

/**
 * Utility function to safely combine class names (same as clsx / Shadcn cn)
 */
export function cn(...inputs: (string | undefined | null | false)[]): string {
  return inputs.filter(Boolean).join(" ");
}
