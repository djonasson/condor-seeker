Feature: Player Setup
  As a golfer using Condor Seeker
  I want to manage player profiles
  So that I can track scores and stats for each player

  Scenario: Create a new player with name and handicap
    Given I am on the add player page
    When I enter "Tiger Woods" as the player name
    And I enter 6.2 as the handicap index
    And I select "male" as the gender
    And I save the player
    Then a player named "Tiger Woods" should exist
    And the player "Tiger Woods" should have a handicap index of 6.2

  Scenario: Validate player name is required
    Given I am on the add player page
    When I leave the player name empty
    And I attempt to save the player
    Then I should see a validation error "Name is required"

  Scenario: Validate handicap range lower bound
    Given I am on the add player page
    When I enter "Alice" as the player name
    And I enter -1 as the handicap index
    And I attempt to save the player
    Then I should see a validation error "Handicap must be between 0 and 54"

  Scenario: Validate handicap range upper bound
    Given I am on the add player page
    When I enter "Alice" as the player name
    And I enter 55 as the handicap index
    And I attempt to save the player
    Then I should see a validation error "Handicap must be between 0 and 54"

  Scenario: Edit an existing player
    Given a player "Rory McIlroy" exists with handicap index 3.0
    And I am on the edit page for player "Rory McIlroy"
    When I change the player name to "Rory McIlroy Jr"
    And I change the handicap index to 5.5
    And I save the player
    Then a player named "Rory McIlroy Jr" should exist
    And the player "Rory McIlroy Jr" should have a handicap index of 5.5

  Scenario: Delete a player with confirmation
    Given a player "Phil Mickelson" exists with handicap index 4.0
    And I am on the player list page
    When I click delete on player "Phil Mickelson"
    Then I should see a delete confirmation dialog
    When I confirm the deletion
    Then player "Phil Mickelson" should no longer exist

  Scenario: Cancel player deletion
    Given a player "Phil Mickelson" exists with handicap index 4.0
    And I am on the player list page
    When I click delete on player "Phil Mickelson"
    Then I should see a delete confirmation dialog
    When I cancel the deletion
    Then a player named "Phil Mickelson" should exist

  Scenario: Add a club to a player
    Given I am on the add player page
    And I have entered "Jordan Spieth" as the player name
    When I click "Add Club"
    And I select "Driver" as the club type
    And I enter "TaylorMade" as the club brand
    And I enter 260 as the carry distance
    And I save the club
    Then the player's club list should contain a "Driver" by "TaylorMade"

  Scenario: Edit a club
    Given I am on the player form page with a "7-Iron" club by "Callaway" with carry distance 150
    When I click edit on the "7-Iron" club
    And I change the carry distance to 155
    And I save the club
    Then the "7-Iron" club should have a carry distance of 155

  Scenario: Delete a club
    Given I am on the player form page with a "PW" club by "Titleist" with carry distance 120
    When I click delete on the "PW" club
    Then the player's club list should not contain a "PW" club
