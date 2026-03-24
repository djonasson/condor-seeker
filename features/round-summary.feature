Feature: Round Summary
  As a golfer using Condor Seeker
  I want to view a summary after completing a round
  So that I can review my performance

  Background:
    Given a completed stroke play round on "Torrey Pines" with 18 holes
    And player "Dustin Johnson" played from the "White" tee
    And "Dustin Johnson" scored a total gross of 78 and net of 73

  Scenario: View final scorecard after completing round
    When I view the round summary
    Then I should see the course name "Torrey Pines"
    And I should see the date of the round
    And I should see the scoring system "stroke"
    And I should see the full scorecard table

  Scenario: Shows total gross and net scores
    When I view the round summary
    Then I should see gross score 78 for "Dustin Johnson"
    And I should see net score 73 for "Dustin Johnson"

  Scenario: Round summary for multiple players
    Given player "Brooks Koepka" also played from the "Blue" tee
    And "Brooks Koepka" scored a total gross of 74 and net of 71
    When I view the round summary
    Then I should see gross score 78 for "Dustin Johnson"
    And I should see gross score 74 for "Brooks Koepka"
    And I should see net score 73 for "Dustin Johnson"
    And I should see net score 71 for "Brooks Koepka"

  Scenario: Round is saved to history
    When the round is completed
    Then the round should appear in the round history
    And the saved round should have course "Torrey Pines"
    And the saved round should have a total gross of 78 for "Dustin Johnson"
