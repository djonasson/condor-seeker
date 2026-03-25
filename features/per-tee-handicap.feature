Feature: Per-Tee Handicap (Stroke Index)
  As a golfer playing from a specific tee
  I want the stroke index to vary by tee
  So that handicap allocation reflects each tee's difficulty

  Scenario: Course stores different handicap per tee
    Given a course "Mountain View" with tees "White" and "Red"
    And hole 1 has handicap 3 from "White" tee and handicap 7 from "Red" tee
    Then hole 1 handicap from "White" tee should be 3
    And hole 1 handicap from "Red" tee should be 7

  Scenario: Stroke allocation uses correct handicap for player's tee
    Given a course with per-tee handicaps
    And player "Alice" plays from "White" tee with handicap index 10
    And player "Bob" plays from "Red" tee with handicap index 10
    Then "Alice" stroke allocation should use "White" tee handicaps
    And "Bob" stroke allocation should use "Red" tee handicaps

  Scenario: Scorecard displays correct handicap for each player's tee
    Given an active round on a course with per-tee handicaps
    And player "Alice" plays from "White" tee
    And player "Bob" plays from "Red" tee
    When viewing the scorecard for hole 1
    Then "Alice" should see handicap 1 for hole 1
    And "Bob" should see handicap 18 for hole 1

  Scenario: Each player's card shows their own par, distance, and handicap
    Given an active round on a course with per-tee handicaps
    And player "Alice" plays from "White" tee
    And player "Bob" plays from "Red" tee
    When viewing the scorecard for hole 1
    Then each player card should show their tee-specific par
    And each player card should show their tee-specific distance
    And each player card should show their tee-specific handicap

  Scenario: Legacy course with flat handicap is migrated
    Given a course stored with flat handicap 5 on hole 1
    And the course has tees "White" and "Red"
    When the database migration runs
    Then hole 1 should have handicapByTee with value 5 for both tees
