/**
 * HomePage.ts
 *
 * Page Object Model for the ParaBank Home / Login page.
 * Encapsulates all selectors and actions related to the home page,
 * keeping step definitions free of raw locator strings.
 */

import { Page } from "playwright";
import { ENV } from "../../config/env.config";

export class HomePage {
  private readonly page: Page;

  // ── Selectors ──────────────────────────────────────────────────────────────
  private readonly usernameInput = 'input[name="username"]';
  private readonly passwordInput = 'input[name="password"]';
  private readonly loginButton = 'input[value="Log In"]';
  private readonly registerLink = 'a[href*="register"]';
  private readonly loginErrorMessage = ".error";

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor(page: Page) {
    this.page = page;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Navigates to the ParaBank home page using BASE_URL from config.
   * Waits for the page to fully load before returning.
   */
  async navigate(): Promise<void> {
    await this.page.goto(ENV.BASE_URL, { waitUntil: "networkidle" });
  }

  /**
   * Clicks the "Register" link to navigate to the registration page.
   * Waits for the registration form to appear before returning.
   */
  async clickRegister(): Promise<void> {
    await this.page.click(this.registerLink);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Fills in and submits the login form.
   * Waits for the page to settle after clicking Log In.
   *
   * NOTE: If the user is already logged in after registration,
   * ParaBank redirects to the overview page — waitForLoadState
   * ensures we don't proceed before that redirect completes.
   *
   * @param username - The username to log in with
   * @param password - The password to log in with
   */
  async login(username: string, password: string): Promise<void> {
    await this.page.fill(this.usernameInput, username);
    await this.page.fill(this.passwordInput, password);
    await this.page.click(this.loginButton);

    // Wait for the page to fully load after login (handles redirects too)
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Returns the text of the login error message, if visible.
   * Used in negative test scenarios to assert failed login feedback.
   */
  async getLoginErrorText(): Promise<string> {
    // Wait for the error element to appear before reading its text
    await this.page.waitForSelector(this.loginErrorMessage, { timeout: 10000 });
    return (await this.page.textContent(this.loginErrorMessage)) ?? "";
  }

  /**
 * Logs out the current user by clicking the Log Out link.
 * Waits for the home page login form to reappear before returning.
 * Called before login steps when the user may already be authenticated.
 */
async logout(): Promise<void> {
  // Only log out if the logout link is present (i.e. user is logged in)
  const logoutLink = this.page.locator('a[href*="logout"]');
  const isLoggedIn = await logoutLink.isVisible();

  if (isLoggedIn) {
    await logoutLink.click();
    await this.page.waitForLoadState("networkidle");
    console.log("[HomePage] Logged out successfully.");
  }
}

}
