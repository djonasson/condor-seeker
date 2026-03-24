Feature: Course Favorites and Search
  As a golfer using Condor Seeker
  I want to star my favorite courses and search through all courses
  So that I can quickly find the course I want to play

  Scenario: Star a course
    Given a course "Pine Valley" exists
    When I star the course "Pine Valley"
    Then "Pine Valley" should be marked as starred

  Scenario: Unstar a course
    Given a course "Pine Valley" exists
    And "Pine Valley" is starred
    When I unstar the course "Pine Valley"
    Then "Pine Valley" should not be marked as starred

  Scenario: Starred courses appear first in round setup
    Given the following courses exist:
      | name         | starred |
      | Alpha Club   | false   |
      | Beta Resort  | true    |
      | Cedar Links  | false   |
      | Delta Course | true    |
    When I view the course selector in round setup
    Then the courses should be ordered with starred first:
      | name         |
      | Beta Resort  |
      | Delta Course |
      | Alpha Club   |
      | Cedar Links  |

  Scenario: Search courses by name
    Given the following courses exist:
      | name             | starred |
      | Pine Valley      | true    |
      | Pebble Beach     | false   |
      | Augusta National | false   |
      | Pine Hills       | false   |
    When I search for "Pine"
    Then the search results should contain "Pine Valley" and "Pine Hills"
    And the search results should not contain "Pebble Beach" or "Augusta National"

  Scenario: Search is case-insensitive
    Given a course "Augusta National" exists
    When I search for "augusta"
    Then the search results should contain "Augusta National"

  Scenario: Clear search shows all courses with starred first
    Given the following courses exist:
      | name        | starred |
      | Alpha Club  | false   |
      | Beta Resort | true    |
    When I search for "Alpha"
    Then the search results should contain "Alpha Club"
    When I clear the search
    Then the first course in the list should be "Beta Resort"

  Scenario: Paginated course list shows first page
    Given 25 courses exist
    When I view the course selector in round setup
    Then I should see 10 courses on the first page
    And I should see pagination controls

  Scenario: Navigate to second page of courses
    Given 25 courses exist
    When I view the course selector in round setup
    And I go to page 2
    Then I should see 10 courses on the second page

  Scenario: Last page shows remaining courses
    Given 25 courses exist
    When I view the course selector in round setup
    And I go to page 3
    Then I should see 5 courses on the last page

  Scenario: Search results are also paginated
    Given 15 courses exist with "Golf" in the name
    When I search for "Golf"
    Then I should see 10 courses on the first page
    And I should see pagination controls
