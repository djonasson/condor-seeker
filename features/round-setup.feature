Feature: Round Setup
  As a golfer using Condor Seeker
  I want to set up a new round
  So that I can begin scoring my game

  Background:
    Given a course "Torrey Pines" exists with 18 holes and tees "White" and "Blue"
    And a player "Dustin Johnson" exists with handicap index 5.0
    And a player "Brooks Koepka" exists with handicap index 3.0

  Scenario: Select a course for a round
    Given I am on the round setup page at step 1
    When I select "Torrey Pines" as the course
    Then "Torrey Pines" should be shown as the selected course
    And the "Next" button should be enabled

  Scenario: Cannot proceed without selecting a course
    Given I am on the round setup page at step 1
    And no course is selected
    Then the "Next" button should be disabled

  Scenario: Select players and assign tees
    Given I am on the round setup page at step 2
    And "Torrey Pines" is selected as the course
    When I add player "Dustin Johnson" with tee "White"
    And I add player "Brooks Koepka" with tee "Blue"
    Then 2 players should be selected
    And the "Next" button should be enabled

  Scenario: Cannot proceed without selecting at least one player
    Given I am on the round setup page at step 2
    And "Torrey Pines" is selected as the course
    And no players are selected
    Then the "Next" button should be disabled

  Scenario: Choose stroke play scoring system
    Given I am on the round setup page at step 3
    And "Torrey Pines" is selected as the course
    And player "Dustin Johnson" is selected with tee "White"
    When I select "stroke" as the scoring system
    Then the scoring system should be set to "stroke"

  Scenario: Choose stableford scoring system
    Given I am on the round setup page at step 3
    And "Torrey Pines" is selected as the course
    And player "Dustin Johnson" is selected with tee "White"
    When I select "stableford" as the scoring system
    Then the scoring system should be set to "stableford"

  Scenario: Start a round with all selections made
    Given I am on the round setup page at step 3
    And "Torrey Pines" is selected as the course
    And player "Dustin Johnson" is selected with tee "White"
    And "stroke" is selected as the scoring system
    When I click "Start Round"
    Then an active round should be initialized for "Torrey Pines"
    And the round should use "stroke" scoring
    And I should be navigated to the scorecard page
