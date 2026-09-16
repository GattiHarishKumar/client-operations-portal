Feature: Architectural Client Management
  As Anna, the architectural firm owner
  I want to register and schedule meetings for clients
  In order to maintain client portfolios and prevent meeting collisions

  Scenario: Register a new client with complete information
    Given I am on the "Add Client" page
    When I fill in "Contact Person" with "Marcus Aurelius"
    And I fill in "Firm / Company Name" with "Pantheon Designs"
    And I fill in "Work Email" with "marcus@pantheon.com"
    And I fill in "Phone Number" with "+1-555-0177"
    And I click "Save Client"
    Then I should see "Client registered successfully!"
    And the client "Marcus Aurelius" should appear in the active client list

  Scenario: Attempt client registration with missing required fields
    Given I am on the "Add Client" page
    When I fill in "Contact Person" with ""
    And I click "Save Client"
    Then I should see an error message "Name is required."
    And the record should not be saved to the database

  Scenario: Schedule a project sync meeting
    Given a client exists with name "Marcus Aurelius"
    When I navigate to the "Meeting Scheduler"
    And I select client "Marcus Aurelius"
    And I set the meeting date to "Tomorrow at 10:00 AM"
    And I set the agenda to "Review Schematic Designs"
    And I click "Confirm & Schedule"
    Then the meeting status should display "Scheduled"

  Scenario: Reject a meeting in the past
    Given I am on the "Meeting Scheduler"
    When I set the meeting date to "Yesterday at 10:00 AM"
    And I click "Confirm & Schedule"
    Then I should see an error message "Meeting must be scheduled for a future time slot."
