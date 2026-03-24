Feature: Application Settings
  As a golfer using Condor Seeker
  I want to configure application settings
  So that the app matches my preferences

  Background:
    Given I am on the settings page

  Scenario: Change theme to dark mode
    Given the current theme is "light"
    When I select "dark" as the theme
    Then the theme should be set to "dark"

  Scenario: Change theme to light mode
    Given the current theme is "dark"
    When I select "light" as the theme
    Then the theme should be set to "light"

  Scenario: Change distance unit to yards
    Given the current distance unit is "meters"
    When I select "yards" as the distance unit
    Then the distance unit should be set to "yards"

  Scenario: Change distance unit to meters
    Given the current distance unit is "yards"
    When I select "meters" as the distance unit
    Then the distance unit should be set to "meters"

  Scenario: Change temperature unit to fahrenheit
    Given the current temperature unit is "celsius"
    When I select "fahrenheit" as the temperature unit
    Then the temperature unit should be set to "fahrenheit"

  Scenario: Change temperature unit to celsius
    Given the current temperature unit is "fahrenheit"
    When I select "celsius" as the temperature unit
    Then the temperature unit should be set to "celsius"

  Scenario: Settings persist across page reloads
    Given the current theme is "light"
    And the current distance unit is "meters"
    And the current temperature unit is "celsius"
    When I select "dark" as the theme
    And I select "yards" as the distance unit
    And I select "fahrenheit" as the temperature unit
    And I reload the settings page
    Then the theme should be set to "dark"
    And the distance unit should be set to "yards"
    And the temperature unit should be set to "fahrenheit"

  Scenario: Change language
    Given the current language is "en"
    When I select "en" as the language
    Then the language should be set to "en"

  Scenario: Set GolfCourseAPI key
    Given no API key is configured
    When I enter "abc123-test-key" as the GolfCourseAPI key
    And I save the API key
    Then the GolfCourseAPI key should be stored as "abc123-test-key"

  Scenario: Update an existing GolfCourseAPI key
    Given the GolfCourseAPI key is set to "old-key-value"
    When I enter "new-key-value" as the GolfCourseAPI key
    And I save the API key
    Then the GolfCourseAPI key should be stored as "new-key-value"
