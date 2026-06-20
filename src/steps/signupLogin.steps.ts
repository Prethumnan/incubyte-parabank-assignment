/**
 * signupLogin.steps.ts
 *
 * Step definitions for the ParaBank Sign-Up and Login feature.
 * Each step maps a Gherkin sentence from the .feature file to an action
 * using Page Object classes. No selectors or URLs appear here.
 */

import { Given, When, Then } from "@cucumber/cucumber";
import { expect } from "@playwright/test";
import { ParaBankWorld } from "../utils/world";
import { HomePage } from "../pages/HomePage";
import { RegisterPage } from "../pages/RegisterPage";
import { AccountOverviewPage } from "../pages/AccountOverviewPage";

// ── Given Steps ──────────────────────────────────────────────────────────────

/**
 * Navigates to the ParaBank home page before each scenario.
 */
Given("I am on the ParaBank home page", async function (this: ParaBankWorld) {
  const homePage = new HomePage(this.page);
  await homePage.navigate();
});

/**
 * Registers a brand-new account using the pre-generated testUser.
 * Used as a precondition in scenarios that require an existing account.
 */
Given(
  "I have registered a new account",
  async function (this: ParaBankWorld) {
    const homePage = new HomePage(this.page);
    const registerPage = new RegisterPage(this.page);

    // Navigate to home first (in case we're not already there)
    await homePage.navigate();

    // Go to registration page and fill form
    await homePage.clickRegister();
    await registerPage.fillRegistrationForm(this.testUser);
    await registerPage.submitRegistration();

    // Confirm registration succeeded before proceeding
    const success = await registerPage.isRegistrationSuccessful();
    expect(success).toBeTruthy();

    console.log(
      `[Given] Account registered: username="${this.testUser.username}"`
    );
  }
);

// ── When Steps ───────────────────────────────────────────────────────────────

/**
 * Clicks the Register link on the home page to open the registration form.
 */
When(
  "I navigate to the registration page",
  async function (this: ParaBankWorld) {
    const homePage = new HomePage(this.page);
    await homePage.clickRegister();
  }
);

/**
 * Fills the registration form using the dynamically generated test user.
 */
When(
  "I fill in the registration form with valid details",
  async function (this: ParaBankWorld) {
    const registerPage = new RegisterPage(this.page);
    await registerPage.fillRegistrationForm(this.testUser);
  }
);

/**
 * Submits the completed registration form.
 */
When(
  "I submit the registration form",
  async function (this: ParaBankWorld) {
    const registerPage = new RegisterPage(this.page);
    await registerPage.submitRegistration();
  }
);

/**
 * Logs in using the credentials of the pre-registered test user.
 */
When(
  "I log in with the registered credentials",
  async function (this: ParaBankWorld) {
    const homePage = new HomePage(this.page);

    // After registration the user is already logged in.
    // We must log out first so the login form is visible.
    await homePage.logout();
    await homePage.login(this.testUser.username, this.testUser.password);

    console.log(`[When] Logged in as: "${this.testUser.username}"`);
  }
);

/**
 * Attempts a login with clearly invalid credentials.
 * Used in the negative test scenario.
 */
When(
  "I attempt to log in with invalid credentials",
  async function (this: ParaBankWorld) {
    const homePage = new HomePage(this.page);
    // Use obviously wrong values — no env vars needed for invalid data
    await homePage.login("invalid_user_xyz", "WrongPass999!");
  }
);

/**
 * Clicks the Accounts Overview link after login to load the balance table.
 */
When(
  "I navigate to the accounts overview",
  async function (this: ParaBankWorld) {
    const accountPage = new AccountOverviewPage(this.page);
    await accountPage.navigateToAccountsOverview();
  }
);

// ── Then Steps ───────────────────────────────────────────────────────────────

/**
 * Asserts that the registration success message is shown.
 */
Then(
  "I should see a successful registration confirmation",
  async function (this: ParaBankWorld) {
    const registerPage = new RegisterPage(this.page);
    const isSuccessful = await registerPage.isRegistrationSuccessful();
    expect(isSuccessful).toBeTruthy();
    console.log("[Then] Registration confirmed successfully.");
  }
);

/**
 * Asserts that the user is now on the logged-in dashboard.
 */
Then(
  "I should be logged in successfully",
  async function (this: ParaBankWorld) {
    const accountPage = new AccountOverviewPage(this.page);
    const loggedIn = await accountPage.isLoggedIn();
    expect(loggedIn).toBeTruthy();
    console.log("[Then] Login verified — user is on the dashboard.");
  }
);

/**
 * Retrieves and logs all account balances shown after login.
 * Asserts that at least one balance is displayed on the page.
 */
Then(
  "the account balances should be displayed and logged to the console",
  async function (this: ParaBankWorld) {
    const accountPage = new AccountOverviewPage(this.page);
    const balances = await accountPage.logAccountBalances();

    // Ensure the page actually returned balance data
    expect(balances.length).toBeGreaterThan(0);
    console.log(`[Then] ${balances.length} account balance(s) logged.`);
  }
);

/**
 * Asserts that a login error message is visible after a failed login attempt.
 */
Then(
  "I should see a login error message",
  async function (this: ParaBankWorld) {
    const homePage = new HomePage(this.page);
    const errorText = await homePage.getLoginErrorText();
    expect(errorText.length).toBeGreaterThan(0);
    console.log(`[Then] Login error displayed: "${errorText.trim()}"`);
  }
);
