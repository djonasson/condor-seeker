Feature: Scorecard Defaults
  As a golfer using Condor Seeker
  I want sensible default values when I visit a hole for the first time
  So that I don't have to enter every field from scratch

  Background:
    Given an active stroke play round on "Torrey Pines" with 18 holes
    And player "Dustin Johnson" is playing from the "White" tee
    And I am on the scorecard page

  Scenario: Default gross equals par plus handicap strokes on first visit
    Given hole 1 has par 4 and handicap 1
    And "Dustin Johnson" receives 1 handicap stroke on hole 1
    When I visit hole 1 for the first time
    Then the default gross for "Dustin Johnson" on hole 1 should be 5

  Scenario: Default putts is 2 on first visit
    When I visit hole 1 for the first time
    Then the default putts for "Dustin Johnson" on hole 1 should be 2

  Scenario: Default FIR is true for par 4 or higher on first visit
    Given hole 1 has par 4 and handicap 1
    When I visit hole 1 for the first time
    Then the default FIR for "Dustin Johnson" on hole 1 should be true

  Scenario: Default GIR is true on first visit
    When I visit hole 1 for the first time
    Then the default GIR for "Dustin Johnson" on hole 1 should be true

  Scenario: No FIR default for par 3 holes
    Given hole 1 has par 3 and handicap 1
    When I visit hole 1 for the first time
    Then the FIR for "Dustin Johnson" on hole 1 should not be set

  Scenario: Par 3 default gross equals 3 plus handicap strokes
    Given hole 1 has par 3 and handicap 1
    And "Dustin Johnson" receives 1 handicap stroke on hole 1
    When I visit hole 1 for the first time
    Then the default gross for "Dustin Johnson" on hole 1 should be 4

  Scenario: Edited values persist after navigating away and back
    Given hole 1 has par 4 and handicap 1
    When I visit hole 1 for the first time
    And I change the gross score to 6 for "Dustin Johnson"
    And I navigate to hole 2
    And I navigate to hole 1
    Then the score for hole 1 should show 6 for "Dustin Johnson"

  Scenario: Defaults are not re-applied to already-visited holes
    Given hole 1 has par 4 and handicap 1
    When I visit hole 1 for the first time
    And I change the gross score to 6 for "Dustin Johnson"
    And I enter 1 putts for "Dustin Johnson" on hole 1
    And I navigate to hole 2
    And I navigate to hole 1
    Then the score for hole 1 should show 6 for "Dustin Johnson"
    And the putts for hole 1 should be 1 for "Dustin Johnson"
