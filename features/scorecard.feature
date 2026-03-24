Feature: Scorecard
  As a golfer using Condor Seeker
  I want to enter and view scores during a round
  So that I can track my performance hole by hole

  Background:
    Given an active stroke play round on "Torrey Pines" with 18 holes
    And player "Dustin Johnson" is playing from the "White" tee
    And I am on the scorecard page

  Scenario: Enter a score for a hole
    Given I am on hole 1 with par 4
    When I enter a gross score of 5 for "Dustin Johnson"
    Then the score for hole 1 should show 5 for "Dustin Johnson"

  Scenario: Navigate to the next hole
    Given I am on hole 1 with par 4
    And I have entered a score of 4 for "Dustin Johnson" on hole 1
    When I navigate to the next hole
    Then I should be on hole 2

  Scenario: Navigate to the previous hole
    Given I am on hole 3
    When I navigate to the previous hole
    Then I should be on hole 2

  Scenario: Navigate to a specific hole
    Given I am on hole 1
    When I navigate to hole 7
    Then I should be on hole 7

  Scenario: Running total updates after each hole entry
    Given I have entered the following scores for "Dustin Johnson":
      | hole | par | gross |
      | 1    | 4   | 5     |
      | 2    | 3   | 3     |
      | 3    | 5   | 6     |
    Then the running total for "Dustin Johnson" should show a gross of 14

  Scenario: Net score calculation with handicap strokes
    Given hole 1 has par 4 and handicap 1
    And "Dustin Johnson" receives 1 handicap stroke on hole 1
    When I enter a gross score of 5 for "Dustin Johnson" on hole 1
    Then the net score for hole 1 should be 4 for "Dustin Johnson"

  Scenario: Edit a previous hole's score
    Given I have entered a score of 6 for "Dustin Johnson" on hole 1
    And I am on hole 3
    When I navigate to hole 1
    And I change the gross score to 5 for "Dustin Johnson"
    Then the score for hole 1 should show 5 for "Dustin Johnson"

  Scenario: View scorecard table
    Given I have entered scores for holes 1 through 5 for "Dustin Johnson"
    When I click the table view button
    Then I should see the full scorecard table
    And the table should show scores for holes 1 through 5

  Scenario: Abandon a round with confirmation
    Given I have entered scores for holes 1 through 3 for "Dustin Johnson"
    When I click the abandon round button
    Then I should see an abandon confirmation dialog
    When I confirm abandoning the round
    Then the active round should be cleared
    And I should be navigated to the home page

  Scenario: Cancel abandoning a round
    Given I have entered scores for holes 1 through 3 for "Dustin Johnson"
    When I click the abandon round button
    Then I should see an abandon confirmation dialog
    When I cancel abandoning the round
    Then I should still be on the scorecard page
    And the active round should still exist
