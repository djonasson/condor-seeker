Feature: Scorecard Player Card Information
  As a golfer using Condor Seeker
  I want each player's scorecard to show their tee, formatted distances, and running totals
  So that I can clearly see which tee each player is on and track progress at a glance

  Background:
    Given a course "Pine Valley" with 18 holes and tees:
      | tee   | courseRating | slopeRating |
      | White | 72.0         | 130         |
      | Blue  | 74.5         | 140         |
    And the following hole data:
      | hole | tee   | par | handicap | distance |
      | 1    | White | 4   | 3        | 370      |
      | 1    | Blue  | 4   | 3        | 400      |

  Scenario: Player card shows tee name
    Given an active round on "Pine Valley" with:
      | player | tee   |
      | Alice  | White |
      | Bob    | Blue  |
    When I view hole 1 on the scorecard
    Then the card for "Alice" should show tee name "White"
    And the card for "Bob" should show tee name "Blue"

  Scenario: Distance is shown with the user's preferred unit in meters
    Given the user's distance unit is "meters"
    And an active round on "Pine Valley" with:
      | player | tee   |
      | Alice  | White |
    When I view hole 1 on the scorecard
    Then the card for "Alice" should show distance "370 m"

  Scenario: Distance is shown with the user's preferred unit in yards
    Given the user's distance unit is "yards"
    And an active round on "Pine Valley" with:
      | player | tee   |
      | Alice  | White |
    When I view hole 1 on the scorecard
    Then the card for "Alice" should show distance "405 yd"

  Scenario: Player card shows running totals in stroke play
    Given an active round on "Pine Valley" with stroke play:
      | player | tee   |
      | Alice  | White |
    And "Alice" has scored the following:
      | hole | gross |
      | 1    | 5     |
    When I view hole 1 on the scorecard
    Then the card for "Alice" should show a total gross of 5
    And the card for "Alice" should show a total net score
    And the card for "Alice" should show the score to par

  Scenario: Player card shows running totals with points in stableford
    Given an active round on "Pine Valley" with stableford:
      | player | tee   |
      | Alice  | White |
    And "Alice" has scored the following:
      | hole | gross |
      | 1    | 4     |
    When I view hole 1 on the scorecard
    Then the card for "Alice" should show total points

  Scenario: No separate summary bar at the bottom
    Given an active round on "Pine Valley" with:
      | player | tee   |
      | Alice  | White |
      | Bob    | Blue  |
    When I view hole 1 on the scorecard
    Then there should be no separate score summary bar
