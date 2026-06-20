/**
 * RegisterPage.ts
 *
 * Page Object Model for the ParaBank Registration page.
 * Encapsulates all form fields and submission logic for account creation.
 */

import { Page } from "playwright";
import { TestUser } from "../utils/testData.generator";

export class RegisterPage {
  private readonly page: Page;

  // ── Selectors ──────────────────────────────────────────────────────────────

  private readonly firstNameInput = 'input[id="customer.firstName"]';
  private readonly lastNameInput = 'input[id="customer.lastName"]';
  private readonly addressInput = 'input[id="customer.address.street"]';
  private readonly cityInput = 'input[id="customer.address.city"]';
  private readonly stateInput = 'input[id="customer.address.state"]';
  private readonly zipCodeInput = 'input[id="customer.address.zipCode"]';
  private readonly phoneInput = 'input[id="customer.phoneNumber"]';
  private readonly ssnInput = 'input[id="customer.ssn"]';
  private readonly usernameInput = 'input[id="customer.username"]';
  private readonly passwordInput = 'input[id="customer.password"]';
  private readonly confirmPasswordInput = 'input[id="repeatedPassword"]';
  private readonly registerButton = 'input[value="Register"]';
  private readonly successPanel = "#rightPanel";

  // ── Constructor ────────────────────────────────────────────────────────────

  constructor(page: Page) {
    this.page = page;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Fills all fields of the registration form using a TestUser object.
   */
  async fillRegistrationForm(user: TestUser): Promise<void> {
    await this.page.fill(this.firstNameInput, user.firstName);
    await this.page.fill(this.lastNameInput, user.lastName);
    await this.page.fill(this.addressInput, user.address);
    await this.page.fill(this.cityInput, user.city);
    await this.page.fill(this.stateInput, user.state);
    await this.page.fill(this.zipCodeInput, user.zipCode);
    await this.page.fill(this.phoneInput, user.phone);
    await this.page.fill(this.ssnInput, user.ssn);
    await this.page.fill(this.usernameInput, user.username);
    await this.page.fill(this.passwordInput, user.password);
    await this.page.fill(this.confirmPasswordInput, user.password);
  }

  /**
   * Clicks the Register button to submit the registration form.
   */
  async submitRegistration(): Promise<void> {
    await this.page.click(this.registerButton);
    // Wait for the page to settle after form submission
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Returns true if the post-registration success message is visible.
   * ParaBank shows "Your account was created successfully." in #rightPanel.
   */
  async isRegistrationSuccessful(): Promise<boolean> {
    try {
      await this.page.waitForSelector(this.successPanel, { timeout: 10000 });
      const content = await this.page.textContent(this.successPanel);
      const text = content?.toLowerCase() ?? "";

      // Log actual content to help debug if this fails again
      console.log(`[RegisterPage] rightPanel text: "${content?.trim()}"`);

      return (
        text.includes("created successfully") ||
        text.includes("welcome") ||
        text.includes("you are now logged in") ||
        text.includes("your account")
      );
    } catch {
      return false;
    }
  }
}