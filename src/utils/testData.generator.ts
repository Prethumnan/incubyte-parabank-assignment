/**
 * testData.generator.ts
 *
 * Generates unique, randomised test user data at runtime.
 * Using dynamic data ensures no conflicts between test runs
 * and avoids any hardcoded values in the codebase.
 *
 * NOTE: Usernames are kept under 20 characters to respect
 * ParaBank's username field length limit. Longer usernames
 * get silently truncated by the browser, causing false
 * "username already exists" errors.
 */

import { ENV } from "../../config/env.config";

/** Shape of a generated test user — mirrors the ParaBank registration form */
export interface TestUser {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  phone: string;
  ssn: string;
  username: string;
  password: string;
}

// ── Helpers ────────────────────────────────────────────────────────────────

/**
 * Generates a short unique suffix by combining:
 * - Last 5 digits of the current timestamp  → changes every millisecond
 * - 3 random base-36 characters             → adds extra entropy
 *
 * Result is 8 characters, e.g. "24681abc"
 *
 * Kept short so the full username (prefix + suffix) stays well
 * under ParaBank's 20-character username field limit.
 */
function randomSuffix(): string {
  const ts = Date.now().toString().slice(-5);           // e.g. "24681"
  const rand = Math.random().toString(36).slice(2, 5); // e.g. "abc"
  return `${ts}${rand}`;                               // e.g. "24681abc"
}

// ── Generator ──────────────────────────────────────────────────────────────

/**
 * Generates a complete test user object with all fields required
 * by the ParaBank registration form.
 *
 * - All values are randomised per call to avoid conflicts across scenarios.
 * - Password is pulled from the .env file — never hardcoded.
 * - SSN and phone use numeric-only values as required by the form.
 *
 * @returns A fully populated TestUser object
 */
export function generateTestUser(): TestUser {
  const suffix = randomSuffix();

  // Use the last 9 digits of the timestamp for numeric-only fields (SSN, phone)
  const numericSuffix = Date.now().toString().slice(-9); // e.g. "781924468"

  return {
    firstName: `Test`,
    lastName: `User`,

    // Random house number to avoid duplicate address conflicts
    address: `${Math.floor(Math.random() * 9999) + 1} Elm Street`,

    city: `Springfield`,
    state: `IL`,
    zipCode: `62701`,

    // Phone: "555" + last 7 digits of timestamp → always 10 digits
    phone: `555${numericSuffix.slice(-7)}`,

    // SSN: 9 numeric digits derived from timestamp
    ssn: numericSuffix,

    // Username: "tu_" (3 chars) + suffix (8 chars) = 11 chars total
    // Stays well under ParaBank's 20-character field limit
    username: `tu_${suffix}`,

    // Password comes from .env (USER_PASSWORD) — never hardcoded
    password: ENV.USER_PASSWORD,
  };
}