Feature: Import and Export Data
  As a golfer using Condor Seeker
  I want to export and import my data
  So that I can back up my data or transfer it between devices

  Scenario: Export all data as JSON
    Given the following data exists:
      | courses | players | rounds |
      | 2       | 3       | 5      |
    When I click the export button
    Then a JSON file should be downloaded
    And the exported file should contain 2 courses
    And the exported file should contain 3 players
    And the exported file should contain 5 rounds
    And the exported file should contain an export timestamp

  Scenario: Import data from JSON file
    Given I am on the import/export page
    When I select a valid JSON import file containing:
      | courses | players | rounds |
      | 2       | 1       | 3      |
    Then I should see a preview showing:
      | courses | players | rounds |
      | 2       | 1       | 3      |

  Scenario: Import replaces existing data after confirmation
    Given I am on the import/export page
    And existing data contains 1 course, 1 player, and 2 rounds
    When I select a valid JSON import file containing:
      | courses | players | rounds |
      | 3       | 2       | 5      |
    And I see the import preview
    And I click the import button
    Then I should see a confirmation dialog warning that data will be replaced
    When I confirm the import
    Then the data should be replaced with the imported data
    And I should see an import success message

  Scenario: Cancel import after seeing confirmation
    Given I am on the import/export page
    When I select a valid JSON import file containing:
      | courses | players | rounds |
      | 3       | 2       | 5      |
    And I see the import preview
    And I click the import button
    Then I should see a confirmation dialog warning that data will be replaced
    When I cancel the import
    Then the existing data should remain unchanged

  Scenario: Invalid import file shows error
    Given I am on the import/export page
    When I select an invalid JSON file for import
    Then I should see an import error message
    And the import button should be disabled
