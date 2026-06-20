# ──────────────────────────────────────────────────────────────────────────────
# Feature: ParaBank Sign-Up and Login
#
# Covers the end-to-end flow of:
#   1. Navigating to the ParaBank home page
#   2. Registering a new account
#   3. Logging in with the newly created credentials
#   4. Verifying successful login and viewing account balances
# ──────────────────────────────────────────────────────────────────────────────

Feature: ParaBank User Registration and Login

  As a new visitor to ParaBank
  I want to register for an account and log in
  So that I can access my account overview and view my balance

  Background:
    Given I am on the ParaBank home page

  # ── Happy Path ──────────────────────────────────────────────────────────────

  Scenario: Successfully register a new account
    When I navigate to the registration page
    And I fill in the registration form with valid details
    And I submit the registration form
    Then I should see a successful registration confirmation

  Scenario: Successfully log in with a newly registered account
    Given I have registered a new account
    When I log in with the registered credentials
    Then I should be logged in successfully

  Scenario: View account balance after login
    Given I have registered a new account
    When I log in with the registered credentials
    And I navigate to the accounts overview
    Then the account balances should be displayed and logged to the console

  # ── Negative Scenarios ───────────────────────────────────────────────────────

  Scenario: Fail to log in with incorrect credentials
    When I attempt to log in with invalid credentials
    Then I should see a login error message
