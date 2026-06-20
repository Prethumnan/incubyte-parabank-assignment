/**
 * env.config.ts
 *
 * Central configuration loader.
 * Reads all environment variables from the .env file using dotenv
 * and exports them as a strongly-typed config object.
 *
 * All other files in the project import from here — never from process.env directly.
 */

import * as dotenv from "dotenv";
import * as path from "path";

// Load .env from the project root
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

/**
 * Reads an environment variable and throws a clear error if it is missing.
 * Ensures no silent undefined values sneak into the test run.
 */
function requireEnv(key: string): string {
  const value = process.env[key];
  if (!value) {
    throw new Error(
      `[Config Error] Missing required environment variable: "${key}". ` +
        `Please check your .env file.`
    );
  }
  return value;
}

/**
 * Reads an optional environment variable and returns a fallback if not set.
 */
function optionalEnv(key: string, fallback: string): string {
  return process.env[key] ?? fallback;
}

// ─────────────────────────────────────────────
// Exported configuration object
// ─────────────────────────────────────────────
export const ENV = {
  /** Base URL of the application under test */
  BASE_URL: requireEnv("BASE_URL"),

  /** Whether to run Playwright in headless mode */
  HEADLESS: optionalEnv("HEADLESS", "true") === "true",

  /** Browser viewport dimensions */
  VIEWPORT: {
    WIDTH: parseInt(optionalEnv("VIEWPORT_WIDTH", "1280"), 10),
    HEIGHT: parseInt(optionalEnv("VIEWPORT_HEIGHT", "720"), 10),
  },

  /** Global action/navigation timeout in milliseconds */
  DEFAULT_TIMEOUT: parseInt(optionalEnv("DEFAULT_TIMEOUT", "30000"), 10),

  /** Slow motion delay in milliseconds (useful for debugging) */
  SLOW_MO: parseInt(optionalEnv("SLOW_MO", "0"), 10),

  /** Prefix used to generate unique test usernames at runtime */
  USERNAME_PREFIX: requireEnv("USERNAME_PREFIX"),

  /** Password used during registration and login */
  USER_PASSWORD: requireEnv("USER_PASSWORD"),
} as const;
