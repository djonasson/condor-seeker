Feature: Stats Configuration
  As a golfer using Condor Seeker
  I want to choose which statistics to track during a round
  So that I can customize my scorecard to my needs

  Background:
    Given I am on the settings page

  Scenario: Default enabled stats
    Then the following stats should be enabled:
      | stat              |
      | putts             |
      | fairwayResult     |
      | greenInRegulation |

  Scenario: Enable an advanced stat
    Given the "bunkerHit" stat is disabled
    When I toggle the "bunkerHit" stat
    Then the "bunkerHit" stat should be enabled

  Scenario: Disable a stat
    Given the "putts" stat is enabled
    When I toggle the "putts" stat
    Then the "putts" stat should be disabled

  Scenario: Stats configuration persists
    Given the "bunkerHit" stat is disabled
    When I toggle the "bunkerHit" stat
    And I reload the settings page
    Then the "bunkerHit" stat should be enabled

  Scenario: All available stats are shown
    Then I should see the following stats in the configuration:
      | stat               | tier     |
      | putts              | basic    |
      | fairwayResult      | basic    |
      | greenInRegulation  | basic    |
      | bunkerHit          | advanced |
      | sandSave           | advanced |
      | penaltyStrokes     | advanced |
      | greenMissDirection | advanced |
