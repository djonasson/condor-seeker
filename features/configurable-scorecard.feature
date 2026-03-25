Feature: Configurable Scorecard Stats
  As a golfer using Condor Seeker
  I want the scorecard to show only the stats I have enabled
  So that my scoring experience is streamlined

  Background:
    Given an active stroke play round on "Torrey Pines" with 18 holes
    And player "Dustin Johnson" is playing from the "White" tee
    And I am on the scorecard page
    And I am on hole 1 with par 4

  Scenario: Only enabled stats appear on the scorecard
    Given the enabled stats are "putts,fairwayResult,greenInRegulation"
    Then the scorecard should show inputs for "putts,fairwayResult,greenInRegulation"
    And the scorecard should not show inputs for "bunkerHit,sandSave,penaltyStrokes,greenMissDirection"

  Scenario: Fairway input is hidden on par 3 holes
    Given the enabled stats are "putts,fairwayResult,greenInRegulation"
    And I am on hole 5 with par 3
    Then the scorecard should not show an input for "fairwayResult"

  Scenario: Sand save only appears when bunker is hit
    Given the enabled stats are "bunkerHit,sandSave"
    When I set "bunkerHit" to "true" for "Dustin Johnson"
    Then the scorecard should show an input for "sandSave"

  Scenario: Sand save hidden when bunker is not hit
    Given the enabled stats are "bunkerHit,sandSave"
    When I set "bunkerHit" to "false" for "Dustin Johnson"
    Then the scorecard should not show an input for "sandSave"

  Scenario: Green miss direction appears when GIR is false
    Given the enabled stats are "greenInRegulation,greenMissDirection"
    When I set "greenInRegulation" to "false" for "Dustin Johnson"
    Then the scorecard should show an input for "greenMissDirection"

  Scenario: Green miss direction hidden when GIR is true
    Given the enabled stats are "greenInRegulation,greenMissDirection"
    When I set "greenInRegulation" to "true" for "Dustin Johnson"
    Then the scorecard should not show an input for "greenMissDirection"

  Scenario: Enter fairway result with directional options
    Given the enabled stats are "fairwayResult"
    When I set "fairwayResult" to "left" for "Dustin Johnson"
    Then the fairway result for hole 1 should be "left" for "Dustin Johnson"

  Scenario: Enter penalty strokes
    Given the enabled stats are "penaltyStrokes"
    When I enter 1 penalty stroke for "Dustin Johnson" on hole 1
    Then the penalty strokes for hole 1 should be 1 for "Dustin Johnson"

  Scenario: All stats disabled shows only gross score
    Given the enabled stats are ""
    Then the scorecard should only show the gross score input
