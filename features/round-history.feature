Feature: Round History
  As a golfer using Condor Seeker
  I want to view and manage my past rounds
  So that I can review my performance over time

  Scenario: View list of past rounds
    Given the following rounds have been played:
      | course           | date       | gross | net |
      | Torrey Pines     | 2026-03-01 | 78    | 73  |
      | Pebble Beach     | 2026-03-08 | 82    | 77  |
      | Augusta National | 2026-03-14 | 75    | 72  |
    When I view the round history page
    Then I should see 3 rounds in the list
    And I should see the round at "Torrey Pines" on "2026-03-01"
    And I should see the round at "Pebble Beach" on "2026-03-08"
    And I should see the round at "Augusta National" on "2026-03-14"

  Scenario: View full scorecard for a past round
    Given a round at "Torrey Pines" on "2026-03-01" exists in history
    When I click on the round at "Torrey Pines"
    Then I should see the round detail page
    And I should see the course name "Torrey Pines"
    And I should see the date "2026-03-01"
    And I should see the full scorecard table
    And I should see the total gross and net scores

  Scenario: Delete a round from history
    Given a round at "Torrey Pines" on "2026-03-01" exists in history
    And I am on the round history page
    When I click delete on the round at "Torrey Pines"
    Then I should see a delete confirmation dialog
    When I confirm the deletion
    Then the round at "Torrey Pines" should no longer appear in history

  Scenario: Cancel round deletion
    Given a round at "Torrey Pines" on "2026-03-01" exists in history
    And I am on the round history page
    When I click delete on the round at "Torrey Pines"
    Then I should see a delete confirmation dialog
    When I cancel the deletion
    Then the round at "Torrey Pines" should still appear in history

  Scenario: Empty history shows message
    Given no rounds have been played
    When I view the round history page
    Then I should see a message indicating no rounds have been played
