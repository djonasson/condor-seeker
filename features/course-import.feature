Feature: Course Import
  As a golfer using Condor Seeker
  I want to import golf course data from files or the GolfCourseAPI
  So that I do not have to enter course details manually

  Scenario: Import a course from a valid JSON file
    Given I am on the course import page
    And I am on the file import tab
    When I upload a valid course JSON file for "Royal Melbourne" with 18 holes
    Then I should see a preview card for "Royal Melbourne"
    And the preview should show 18 holes
    When I click the import button
    Then a course named "Royal Melbourne" should be saved

  Scenario: Invalid JSON file shows error
    Given I am on the course import page
    And I am on the file import tab
    When I upload a file containing "this is not json"
    Then I should see the error "Invalid JSON file"

  Scenario: Invalid course JSON format shows error
    Given I am on the course import page
    And I am on the file import tab
    When I upload a JSON file with missing required fields
    Then I should see the error "Invalid course JSON format"

  Scenario: Import a course from GolfCourseAPI search
    Given I am on the course import page
    And I am on the API import tab
    And a GolfCourseAPI key is configured
    When I search for "St Andrews" in the API
    Then I should see search results including "St Andrews Links"
    When I select "St Andrews Links" from the results
    Then I should see the tee selection step

  Scenario: Select tees to import from API
    Given I am on the course import page
    And I am on the API import tab
    And a GolfCourseAPI key is configured
    And I have searched for and selected a course with tees "White", "Blue", and "Black"
    When I select the "White" and "Blue" tees
    And I confirm the tee selection
    Then I should see a preview card for the selected course
    And the preview should include tees "White" and "Blue"
    When I click the import button
    Then the course should be saved with only the "White" and "Blue" tees

  Scenario: API key required message when no key set
    Given I am on the course import page
    And I am on the API import tab
    And no GolfCourseAPI key is configured
    Then I should see a message that an API key is required
