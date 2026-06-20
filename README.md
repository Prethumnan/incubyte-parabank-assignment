# ParaBank Automation — BDD with Playwright & TypeScript

End-to-end automation for the [ParaBank](https://parabank.parasoft.com) demo banking application.  
Built with **Playwright**, **Cucumber (BDD)**, **TypeScript**, and **Page Object Model (POM)**.

---

## Prerequisites

Make sure the following are installed on your machine before proceeding:

| Tool | Version | Install |
|---|---|---|
| [Node.js](https://nodejs.org) | v18 or higher | https://nodejs.org/en/download |
| npm | v9 or higher | Comes bundled with Node.js |

To verify:
```bash
node -v
npm -v
```

---

## Quick Start (2 commands)

### Step 1 — Clone & Install everything

```bash
git clone https://github.com/Prethumnan/incubyte-parabank-assignment.git
cd parabank-automation
npm run setup
```

> `npm run setup` does **all of this in one shot**:
> - Installs all npm packages (`@cucumber/cucumber`, `playwright`, `typescript`, `ts-node`, `dotenv`, etc.)
> - Downloads the Chromium browser used by Playwright

### Step 2 — Configure your environment

```bash
cp .env.example .env
```

The `.env` file already has all the correct values pre-filled. No changes needed to run the tests.

---

## Running Tests

```bash
# Run all scenarios (headless)
npm test

# Run all scenarios + generate HTML report
npm run test:report

# Run with visible browser (useful for debugging)
npm run test:headed

# Type-check the TypeScript without running tests
npm run typecheck
```

The HTML report is saved to: `reports/cucumber-report.html`  
Screenshots on failure are saved to: `screenshots/`

---

## Project Structure

```
parabank-automation/
├── config/
│   └── env.config.ts               # Central env loader — single source of truth
├── features/
│   └── signup-login.feature        # Gherkin BDD scenarios
├── hooks/
│   └── hooks.ts                    # Before/After lifecycle hooks
├── src/
│   ├── pages/
│   │   ├── HomePage.ts             # POM: Home / Login page
│   │   ├── RegisterPage.ts         # POM: Registration page
│   │   └── AccountOverviewPage.ts  # POM: Post-login account dashboard
│   ├── steps/
│   │   └── signupLogin.steps.ts    # Cucumber step definitions
│   └── utils/
│       ├── testData.generator.ts   # Runtime test user data generator
│       └── world.ts                # Custom Cucumber World (shared state)
├── .env                            # Local config (NOT committed to Git)
├── .env.example                    # Template — safe to commit
├── .gitignore
├── cucumber.json                   # Cucumber runner configuration
├── package.json
├── tsconfig.json
└── README.md
```

---

## Scenarios Covered

| # | Scenario | Type |
|---|---|---|
| 1 | Successfully register a new account | Happy path |
| 2 | Successfully log in with a newly registered account | Happy path |
| 3 | View account balance after login (logged to console) | Happy path |
| 4 | Fail to log in with incorrect credentials | Negative |

---

## Key Design Decisions

- **Zero hardcoding** — all URLs, credentials, and settings live in `.env`
- **Page Object Model** — each page is a separate class; steps never touch raw selectors
- **Dynamic test data** — usernames are generated with a timestamp suffix to avoid conflicts between runs
- **BDD Gherkin** — scenarios are readable by non-technical stakeholders
- **Failure screenshots** — automatically captured and embedded in the Cucumber HTML report
- **Custom World** — browser state and test data are shared cleanly across steps without global variables
