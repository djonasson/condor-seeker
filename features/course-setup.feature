Feature: Course Setup
  As a golfer using Condor Seeker
  I want to manage golf courses
  So that I can use them when playing rounds

  Scenario: Create a new 18-hole course with tees
    Given I am on the add course page
    When I enter "Augusta National" as the course name
    And I select 18 as the number of holes
    And I add a tee named "White" with course rating 72.0 and slope rating 113
    And I add a tee named "Blue" with course rating 74.5 and slope rating 131
    And I proceed to hole details
    And I fill in par and distance for all 18 holes
    And I save the course
    Then a course named "Augusta National" should exist
    And the course "Augusta National" should have 18 holes
    And the course "Augusta National" should have tees "White" and "Blue"

  Scenario: Create a course with club name
    Given I am on the add course page
    When I enter "Royal Club" as the club name
    And I enter "Championship Course" as the course name
    And I select 18 as the number of holes
    And I add a tee named "White" with course rating 72.0 and slope rating 113
    And I proceed to hole details
    And I fill in par and distance for all 18 holes
    And I save the course
    Then a course named "Championship Course" should exist
    And the course "Championship Course" should have club name "Royal Club"

  Scenario: Tee total distance is computed from hole distances
    Given I am on the add course page
    When I enter "Distance Test" as the course name
    And I select 9 as the number of holes
    And I add a tee named "White" with course rating 36.0 and slope rating 113
    And I proceed to hole details with empty distances
    And I set hole 1 distance to 400 for tee "White"
    And I set hole 2 distance to 350 for tee "White"
    And I save the course
    Then the course "Distance Test" tee "White" should have a total distance of 750

  Scenario: Tee preset dropdown shows all standard tee names
    Given I am on the add course page
    Then the available tee presets should include "Black", "Gold", "Blue", "Yellow", "Green", "Red", "Orange", "Silver"

  Scenario: Tee preset dropdown excludes already added tees
    Given I am on the add course page
    And the default tee is "White"
    Then the available tee presets should not include "White"
    When I add a tee named "Blue" with course rating 74.5 and slope rating 131
    Then the available tee presets should not include "Blue"

  Scenario: Create a new 9-hole course
    Given I am on the add course page
    When I enter "Pine Hills 9" as the course name
    And I select 9 as the number of holes
    And I add a tee named "Yellow" with course rating 35.5 and slope rating 110
    And I proceed to hole details
    And I fill in par and distance for all 9 holes
    And I save the course
    Then a course named "Pine Hills 9" should exist
    And the course "Pine Hills 9" should have 9 holes

  Scenario: Course name is required
    Given I am on the add course page
    When I leave the course name empty
    And I add a tee named "White" with course rating 72.0 and slope rating 113
    And I attempt to proceed to hole details
    Then I should see a validation error that the course name is required

  Scenario: At least one tee is required
    Given I am on the add course page
    When I enter "Test Course" as the course name
    And I do not add any tees
    And I attempt to proceed to hole details
    Then I should see a validation error that at least one tee is required

  Scenario: Edit an existing course
    Given a course "Pebble Beach" exists with 18 holes and a "White" tee
    And I am on the edit page for course "Pebble Beach"
    When I change the course name to "Pebble Beach Links"
    And I save the course
    Then a course named "Pebble Beach Links" should exist

  Scenario: Delete a course with confirmation
    Given a course "Old Course" exists with 18 holes and a "Red" tee
    And I am on the course list page
    When I click delete on course "Old Course"
    Then I should see a delete confirmation dialog
    When I confirm the deletion
    Then course "Old Course" should no longer exist

  Scenario: Cancel course deletion
    Given a course "Old Course" exists with 18 holes and a "Red" tee
    And I am on the course list page
    When I click delete on course "Old Course"
    Then I should see a delete confirmation dialog
    When I cancel the deletion
    Then a course named "Old Course" should exist
