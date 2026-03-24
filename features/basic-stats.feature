Feature: Basic Statistics
  As a golfer using Condor Seeker
  I want to view my scoring statistics
  So that I can track my improvement and identify areas to work on

  Scenario: View scoring average
    Given the following rounds have been completed:
      | course       | date       | gross | net |
      | Torrey Pines | 2026-02-01 | 78    | 73  |
      | Torrey Pines | 2026-02-15 | 82    | 77  |
      | Pebble Beach | 2026-03-01 | 80    | 75  |
    When I view the statistics page
    Then the scoring average should be 80.0

  Scenario: View putts average
    Given the following rounds have been completed with putts data:
      | course       | date       | totalPutts |
      | Torrey Pines | 2026-02-01 | 32         |
      | Torrey Pines | 2026-02-15 | 30         |
      | Pebble Beach | 2026-03-01 | 34         |
    When I view the statistics page
    Then the putts average should be 32.0

  Scenario: View FIR percentage
    Given rounds have been completed with fairway data:
      | fairwaysHit | fairwayAttempts |
      | 7           | 14              |
      | 9           | 14              |
    When I view the statistics page
    Then the FIR percentage should be 57.1

  Scenario: View GIR percentage
    Given rounds have been completed with green in regulation data:
      | greensHit | greensAttempted |
      | 8         | 18              |
      | 12        | 18              |
    When I view the statistics page
    Then the GIR percentage should be 55.6

  Scenario: Filter stats by date range - last 30 days
    Given the following rounds have been completed:
      | course       | date       | gross | net |
      | Torrey Pines | 2026-01-01 | 85    | 80  |
      | Pebble Beach | 2026-03-01 | 78    | 73  |
      | Pebble Beach | 2026-03-10 | 80    | 75  |
    When I view the statistics page
    And I filter by "last 30 days"
    Then the scoring average should be calculated from 2 rounds
    And the scoring average should be 79.0

  Scenario: Filter stats by date range - last 90 days
    Given the following rounds have been completed:
      | course       | date       | gross | net |
      | Torrey Pines | 2025-06-01 | 90    | 85  |
      | Pebble Beach | 2026-01-15 | 82    | 77  |
      | Pebble Beach | 2026-03-01 | 78    | 73  |
    When I view the statistics page
    And I filter by "last 90 days"
    Then the scoring average should be calculated from 2 rounds

  Scenario: Filter stats by course
    Given the following rounds have been completed:
      | course       | date       | gross | net |
      | Torrey Pines | 2026-02-01 | 78    | 73  |
      | Pebble Beach | 2026-02-15 | 82    | 77  |
      | Torrey Pines | 2026-03-01 | 80    | 75  |
    When I view the statistics page
    And I filter by course "Torrey Pines"
    Then the scoring average should be 79.0
    And the stats should be based on 2 rounds

  Scenario: Empty state when no rounds played
    Given no rounds have been completed
    When I view the statistics page
    Then the scoring average should not be available
    And the putts average should not be available
    And the FIR percentage should not be available
    And the GIR percentage should not be available
    And the number of rounds played should be 0
