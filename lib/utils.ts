import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Tailwind-optimized utility for merging class names.
 * Uses clsx for conditional classes and tailwind-merge for proper Tailwind class conflict resolution.
 *
 * @example
 * ```tsx
 * cn("px-2 py-1", condition && "bg-blue-500", "px-4")
 * // Returns: "py-1 bg-blue-500 px-4" (px-2 is overridden by px-4)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function getAge(
  birthYear: number,
  birthMonth0Based: number,
  birthDay: number
) {
  const now = new Date(); // local timezone (America/Toronto on your machine)
  const birth = new Date(birthYear, birthMonth0Based, birthDay);

  let years = now.getFullYear() - birth.getFullYear();

  const hasNotReachedBirthdayThisYear =
    now.getMonth() < birthMonth0Based ||
    (now.getMonth() === birthMonth0Based && now.getDate() < birthDay);

  if (hasNotReachedBirthdayThisYear) {
    years -= 1;
  }

  return years;
}
