Feature: Scorecard Display
  As a golfer using Condor Seeker
  I want the scorecard to visually distinguish scores relative to par
  So that I can quickly see my performance at a glance

  Background:
    Given a course "Forest Course" with 18 holes and the following tee:
      | tee    | courseRating | slopeRating |
      | Yellow | 74.5         | 146         |
    And the course belongs to club "Midwest Golf Club"
    And the following hole data for tee "Yellow":
      | hole | par | handicap | distance |
      | 1    | 4   | 2        | 380      |
      | 2    | 5   | 10       | 510      |
      | 3    | 3   | 16       | 165      |
      | 4    | 3   | 6        | 170      |
      | 5    | 5   | 18       | 490      |
      | 6    | 4   | 14       | 350      |
      | 7    | 3   | 4        | 155      |
      | 8    | 4   | 12       | 370      |
      | 9    | 4   | 8        | 390      |

  Scenario: Albatross is shown with a filled red circle
    Given a completed hole with par 5 and gross score 2
    Then the score badge should display a "filled-circle" shape with "red" color

  Scenario: Eagle is shown with a double red circle
    Given a completed hole with par 5 and gross score 3
    Then the score badge should display a "double-circle" shape with "red" color

  Scenario: Birdie is shown with a single red circle
    Given a completed hole with par 4 and gross score 3
    Then the score badge should display a "circle" shape with "red" color

  Scenario: Par is shown with a light grey background
    Given a completed hole with par 4 and gross score 4
    Then the score badge should display a "none" shape with "grey" color

  Scenario: Bogey is shown with a single blue rectangle
    Given a completed hole with par 4 and gross score 5
    Then the score badge should display a "rectangle" shape with "blue" color

  Scenario: Double bogey or worse is shown with a double blue rectangle
    Given a completed hole with par 4 and gross score 6
    Then the score badge should display a "double-rectangle" shape with "blue" color

  Scenario: Triple bogey or worse is shown with a filled blue rectangle
    Given a completed hole with par 3 and gross score 6
    Then the score badge should display a "filled-rectangle" shape with "blue" color

  Scenario: Hole-in-one shows a yellow star
    Given a completed hole with par 3 and gross score 1
    Then the score badge should display a "star" shape with "yellow" color

  Scenario: Hole-in-one on par 4 also shows a yellow star
    Given a completed hole with par 4 and gross score 1
    Then the score badge should display a "star" shape with "yellow" color

  Scenario: Traditional scorecard shows HCP row
    When I view the traditional scorecard
    Then I should see a "HCP" row showing the handicap index for each hole
    And hole 1 should show handicap 2
    And hole 7 should show handicap 4

  Scenario: Traditional scorecard shows course info footer
    When I view the traditional scorecard
    Then I should see the course rating "74.5"
    And I should see the slope rating "146"

  Scenario: Traditional scorecard has front nine and back nine sections
    When I view the traditional scorecard
    Then I should see a front nine section with holes 1 through 9
    And I should see column headers for each hole number
    And I should see an "Out" column with the front nine total

  Scenario: Score and par totals shown in footer
    Given the following scores for "Tommy Andrews" on tee "Yellow":
      | hole | gross |
      | 1    | 3     |
      | 2    | 5     |
      | 3    | 3     |
      | 4    | 6     |
      | 5    | 6     |
      | 6    | 3     |
      | 7    | 2     |
      | 8    | 4     |
      | 9    | 7     |
    Then the front nine gross total should be 39
    And the front nine par total should be 35
