/**
 * world.ts
 *
 * Defines the custom Cucumber World class.
 * The World object is shared across all step definitions within a single scenario.
 * It holds the Playwright browser, page instance, and any test-level state
 * (e.g., the generated user) so steps can communicate without global variables.
 */

import { setWorldConstructor, setDefaultTimeout, World, IWorldOptions } from "@cucumber/cucumber";
import { Browser, BrowserContext, Page, chromium } from "playwright";
import { TestUser } from "./testData.generator";
import { ENV } from "../../config/env.config";

// ── Global Timeout ─────────────────────────────────────────────────────────

/**
 * Sets the default timeout for ALL Cucumber steps and hooks to 60 seconds.
 *
 * This is required because cucumber.json's "timeout" key is not always
 * respected at runtime. Calling setDefaultTimeout() here guarantees it
 * is applied before any scenario runs, preventing false 5000ms timeouts
 * on slow network operations like page navigation and form submission.
 */
setDefaultTimeout(60 * 1000);

// ── World Class ────────────────────────────────────────────────────────────

export class ParaBankWorld extends World {
  /** Playwright browser instance (shared for the scenario) */
  browser!: Browser;

  /** Isolated browser context for the scenario */
  context!: BrowserContext;

  /** Active page instance used across all steps */
  page!: Page;

  /**
   * The test user generated before the scenario starts.
   * Steps reference this to fill forms and verify login.
   */
  testUser!: TestUser;

  constructor(options: IWorldOptions) {
    super(options);
  }

  /**
   * Launches the browser and creates a new context and page.
   * Called in the Before hook before each scenario.
   */
  async init(): Promise<void> {
    this.browser = await chromium.launch({
      headless: ENV.HEADLESS,
      slowMo: ENV.SLOW_MO,
    });

    this.context = await this.browser.newContext({
      viewport: {
        width: ENV.VIEWPORT.WIDTH,
        height: ENV.VIEWPORT.HEIGHT,
      },
    });

    this.page = await this.context.newPage();

    // Apply Playwright-level timeout to all page actions
    this.page.setDefaultTimeout(ENV.DEFAULT_TIMEOUT);
  }

  /**
   * Closes the browser after the scenario completes.
   * Called in the After hook to ensure clean teardown.
   */
  async teardown(): Promise<void> {
    await this.browser?.close();
  }
}

// Register our custom World so Cucumber uses it for every scenario
setWorldConstructor(ParaBankWorld);