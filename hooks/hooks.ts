/**
 * hooks.ts
 *
 * Cucumber lifecycle hooks for test setup and teardown.
 *
 * - Before: Launches the browser and generates fresh test data before each scenario.
 * - After:  Takes a screenshot on failure and closes the browser after each scenario.
 */

import { Before, After, Status, ITestCaseHookParameter } from "@cucumber/cucumber";
import * as fs from "fs";
import * as path from "path";
import { ParaBankWorld } from "../src/utils/world";
import { generateTestUser } from "../src/utils/testData.generator";

// ── Before Hook ──────────────────────────────────────────────────────────────

/**
 * Runs before every scenario.
 * - Initialises the browser, context, and page via the World class.
 * - Generates a unique test user so each scenario runs with fresh data.
 */
Before({ timeout: 60000 }, async function (this: ParaBankWorld) {
  await this.init();
  this.testUser = generateTestUser();

  console.log(`\n[Setup] Test user generated: ${this.testUser.username}`);
});

// ── After Hook ───────────────────────────────────────────────────────────────

/**
 * Runs after every scenario.
 * - If the scenario failed, captures a screenshot for debugging.
 * - Closes the browser regardless of pass/fail outcome.
 *
 * @param scenario - Cucumber hook parameter containing scenario result info
 */
After({ timeout: 60000 }, async function (this: ParaBankWorld, scenario: ITestCaseHookParameter) {
  // Take a screenshot only when the scenario fails
  if (scenario.result?.status === Status.FAILED) {
    const screenshotDir = path.resolve("screenshots");

    // Ensure the screenshots directory exists
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }

    // Create a unique filename using the scenario name and timestamp
    const scenarioName = scenario.pickle.name
      .replace(/\s+/g, "_")
      .toLowerCase();
    const timestamp = Date.now();
    const screenshotPath = path.join(
      screenshotDir,
      `FAILED_${scenarioName}_${timestamp}.png`
    );

    // Capture the screenshot and attach it to the Cucumber report
    const screenshot = await this.page.screenshot({ path: screenshotPath });
    await this.attach(screenshot, "image/png");

    console.log(`[Failure] Screenshot saved: ${screenshotPath}`);
  }

  // Always close the browser to free resources
  await this.teardown();
  console.log(`[Teardown] Browser closed.\n`);
});