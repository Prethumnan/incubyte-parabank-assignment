/**
 * AccountOverviewPage.ts
 *
 * Page Object Model for the ParaBank Account Overview page.
 * This page is displayed after a successful login and shows
 * account balances and available funds.
 */

import { Page, ElementHandle } from "playwright";


const COLUMN_HEADERS = {
  ACCOUNT: "Account",
  BALANCE: "Balance",
  AVAILABLE_AMOUNT: "Available Amount",
} as const;
type ColumnHeader = (typeof COLUMN_HEADERS)[keyof typeof COLUMN_HEADERS];
const TIMEOUTS = {ACCOUNTS_AJAX_LOAD_MS: 30_000,} as const;
const ACCOUNT_ROW_LINK_PATTERN = "activity.htm";

export class AccountOverviewPage {
  private readonly page: Page;
  private readonly ajaxLoadTimeoutMs: number;

  // ── Selectors ──────────────────────────────────────────────────────────────
  private readonly welcomeHeader = "#leftPanel .smallText";
  private readonly accountsOverviewLink = '#leftPanel a[href*="overview.htm"]';
  private readonly accountTable = "#accountTable";
  private readonly tableHeaders = "#accountTable thead tr th";
  private readonly tableRows = "#accountTable tbody tr";
  private readonly totalRow = "#accountTable tbody tr:last-child";

  // ── Constructor ────────────────────────────────────────────────────────────

  /**
   * @param page - Playwright page instance
   * @param ajaxLoadTimeoutMs - Override the default wait for account rows to
   *   load (e.g. a slower CI environment). Defaults to TIMEOUTS.ACCOUNTS_AJAX_LOAD_MS.
   */
  constructor(page: Page, ajaxLoadTimeoutMs: number = TIMEOUTS.ACCOUNTS_AJAX_LOAD_MS) {
    this.page = page;
    this.ajaxLoadTimeoutMs = ajaxLoadTimeoutMs;
  }

  // ── Helpers ────────────────────────────────────────────────────────────────

  /**
   * Finds the column index of a given header name in the account table.
   * Returns a 0-based index, or -1 if the header is not found.
   *
   * Uses a "starts with" match rather than strict equality because
   * ParaBank's "Balance" header renders as "Balance*" (a footnote marker).
   */
  private async getColumnIndex(headerName: ColumnHeader): Promise<number> {
    const headers = await this.page.$$(this.tableHeaders);

    for (let i = 0; i < headers.length; i++) {
      const text = (await headers[i].textContent())?.trim() ?? "";
      if (text.startsWith(headerName)) {
        return i;
      }
    }

    return -1;
  }

  /**
   * Returns true if the given row is a real account row, as opposed to the
   * synthetic Total row that ParaBank appends to the same <tbody>.
   */
  private async isAccountRow(row: ElementHandle): Promise<boolean> {
    const link = await row.$(`td a[href*="${ACCOUNT_ROW_LINK_PATTERN}"]`);
    return link !== null;
  }

  // ── Actions ────────────────────────────────────────────────────────────────

  /**
   * Navigates to the Accounts Overview section by clicking the sidebar link,
   * then waits for the AJAX call that populates <tbody> to complete.
   * (The table starts with an empty <tbody> — rows are injected once the
   * /accounts REST call resolves.)
   */
  async navigateToAccountsOverview(): Promise<void> {
    await this.page.click(this.accountsOverviewLink);
    await this.page.waitForSelector(this.accountTable, { state: "visible" });

    await this.page.waitForFunction(
      (rowSelector) => document.querySelectorAll(rowSelector).length > 0,
      this.tableRows,
      { timeout: this.ajaxLoadTimeoutMs }
    );
  }

  /**
   * Checks whether the welcome header is visible in the left panel.
   * Used to assert that the user has been successfully logged in.
   */
  async isLoggedIn(): Promise<boolean> {
    return this.page.isVisible(this.welcomeHeader);
  }

  /**
   * Generic column reader — returns every real account row's value for the
   * given column, skipping the injected Total row. Reusable for any column
   * (Balance, Available Amount, ...) without duplicating row-walking logic.
   */
  private async getColumnValues(headerName: ColumnHeader): Promise<string[]> {
    const colIndex = await this.getColumnIndex(headerName);

    if (colIndex === -1) {
      console.warn(`[AccountOverviewPage] '${headerName}' column not found in table headers.`);
      return [];
    }

    const rows = await this.page.$$(this.tableRows);
    const values: string[] = [];

    for (const row of rows) {
      if (!(await this.isAccountRow(row))) {
        continue; // the injected Total row, not a real account
      }

      const cells = await row.$$("td");
      const cell = cells[colIndex];

      if (cell) {
        const text = (await cell.textContent())?.trim() ?? "";
        if (text) values.push(text);
      }
    }

    return values;
  }

  /**
   * Reads a single column's value from the Total row
   * (last row of <tbody> — see header note on <tfoot>).
   */
  private async getTotalRowValue(headerName: ColumnHeader): Promise<string | null> {
    const colIndex = await this.getColumnIndex(headerName);
    if (colIndex === -1) return null;

    const totalCells = await this.page.$$(`${this.totalRow} td`);
    const cell = totalCells[colIndex];
    if (!cell) return null;

    return (await cell.textContent())?.trim() ?? null;
  }

  /** Returns each account's Balance, in display order. */
  async getAccountBalances(): Promise<string[]> {
    return this.getColumnValues(COLUMN_HEADERS.BALANCE);
  }

  /** Returns each account's Available Amount, in display order. */
  async getAvailableAmounts(): Promise<string[]> {
    return this.getColumnValues(COLUMN_HEADERS.AVAILABLE_AMOUNT);
  }

  /** Returns the grand total balance shown in the Total row. */
  async getTotalBalance(): Promise<string | null> {
    return this.getTotalRowValue(COLUMN_HEADERS.BALANCE);
  }

  /**
   * Retrieves all per-account balances, logs them (plus the total) to the
   * console, and returns the balances array. Logging is kept separate from
   * data retrieval (getAccountBalances/getTotalBalance) so tests can assert
   * on the data directly without depending on console side effects.
   */
  async logAccountBalances(): Promise<string[]> {
    const balances = await this.getAccountBalances();

    console.log("\n──────────────────────────────────────");
    console.log("  Account Balances After Login:");
    console.log("──────────────────────────────────────");
    balances.forEach((balance, index) => {
      console.log(`  Account ${index + 1}: ${balance}`);
    });

    const total = await this.getTotalBalance();
    if (total) {
      console.log("──────────────────────────────────────");
      console.log(`  Total Balance : ${total}`);
    }
    console.log("──────────────────────────────────────\n");

    return balances;
  }
}