Feature: Scoring Engine
  As a golfer using Condor Seeker
  I want scores to be calculated correctly
  So that my round results are accurate

  # Stroke Play Scenarios
  Scenario: Stroke play gross score equals strokes taken
    Given the scoring system is "stroke"
    When a player takes 5 strokes on a par 4 hole with 0 handicap strokes
    Then the gross score should be 5

  Scenario: Stroke play net score with no handicap strokes
    Given the scoring system is "stroke"
    When a player takes 5 strokes on a par 4 hole with 0 handicap strokes
    Then the net score should be 5

  Scenario: Stroke play net score with 1 handicap strokes
    Given the scoring system is "stroke"
    When a player takes 5 strokes on a par 4 hole with 1 handicap strokes
    Then the net score should be 4

  Scenario: Stroke play net score with 2 handicap strokes
    Given the scoring system is "stroke"
    When a player takes 6 strokes on a par 4 hole with 2 handicap strokes
    Then the net score should be 4

  Scenario: Stroke play score to par is even
    Given the scoring system is "stroke"
    When a player takes 4 strokes on a par 4 hole with 0 handicap strokes
    Then the score to par should be 0
    And the formatted score should be "E"

  Scenario: Stroke play score to par is over
    Given the scoring system is "stroke"
    When a player takes 6 strokes on a par 4 hole with 0 handicap strokes
    Then the score to par should be 2
    And the formatted score should be "+2"

  Scenario: Stroke play score to par is under
    Given the scoring system is "stroke"
    When a player takes 3 strokes on a par 4 hole with 0 handicap strokes
    Then the score to par should be -1
    And the formatted score should be "-1"

  Scenario: Stroke play round total
    Given the scoring system is "stroke"
    And the following hole results:
      | grossScore | par | handicapStrokes |
      | 4          | 4   | 0               |
      | 3          | 3   | 0               |
      | 6          | 5   | 1               |
      | 5          | 4   | 0               |
    Then the total gross should be 18
    And the total net should be 17
    And the total to par should be 2

  # Stableford Scenarios
  Scenario: Stableford 0 points for net double bogey or worse
    Given the scoring system is "stableford"
    When a player takes 7 strokes on a par 4 hole with 1 handicap strokes
    Then the stableford points should be 0

  Scenario: Stableford 1 point for net bogey
    Given the scoring system is "stableford"
    When a player takes 5 strokes on a par 4 hole with 0 handicap strokes
    Then the stableford points should be 1

  Scenario: Stableford 2 points for net par
    Given the scoring system is "stableford"
    When a player takes 4 strokes on a par 4 hole with 0 handicap strokes
    Then the stableford points should be 2

  Scenario: Stableford 2 points for net par with handicap strokes
    Given the scoring system is "stableford"
    When a player takes 5 strokes on a par 4 hole with 1 handicap strokes
    Then the stableford points should be 2

  Scenario: Stableford 3 points for net birdie
    Given the scoring system is "stableford"
    When a player takes 3 strokes on a par 4 hole with 0 handicap strokes
    Then the stableford points should be 3

  Scenario: Stableford 4 points for net eagle
    Given the scoring system is "stableford"
    When a player takes 2 strokes on a par 4 hole with 0 handicap strokes
    Then the stableford points should be 4

  Scenario: Stableford 5 points for net albatross or better
    Given the scoring system is "stableford"
    When a player takes 1 strokes on a par 4 hole with 0 handicap strokes
    Then the stableford points should be 5

  Scenario: Stableford formatted score shows points
    Given the scoring system is "stableford"
    When a player takes 4 strokes on a par 4 hole with 0 handicap strokes
    Then the formatted score should be "2 pts"

  Scenario: Stableford round total includes points
    Given the scoring system is "stableford"
    And the following hole results:
      | grossScore | par | handicapStrokes |
      | 4          | 4   | 0               |
      | 3          | 3   | 0               |
      | 6          | 5   | 0               |
      | 5          | 4   | 1               |
    Then the total points should be 7
    And the total gross should be 18

  # Handicap Stroke Allocation
  Scenario: Handicap stroke allocation based on hole handicap
    Given a course with 18 holes
    And hole 1 has a handicap index of 1
    And hole 10 has a handicap index of 10
    And hole 18 has a handicap index of 18
    And a player with a course handicap of 10
    Then hole 1 should receive 1 handicap strokes
    And hole 10 should receive 1 handicap strokes
    And hole 18 should receive 0 handicap strokes

  Scenario: High handicap player receives extra strokes
    Given a course with 18 holes
    And hole 1 has a handicap index of 1
    And a player with a course handicap of 20
    Then hole 1 should receive 2 handicap strokes
