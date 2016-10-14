Feature: StepInto.io static resources
  I should be able to add a single resource
  I should be able to view a list of all resources
  I should be able to view a list of resources by virtual folder
  I should be able to get a single resource
  I should be able to delete a single resource

  Scenario: I want to add a single resource
    Then I can save testresource to the test-resources folder
    Then I can verify that testresource exists in test-resources folder
    And I can verify the contents of testresource in test-resources folder

  Scenario: I want to view all resources
    Then I can get a list of all static resources

  Scenario: I want to view resources in a virtual folder
    Given I have saved testresource to the test-resources folder
    Then I can get a list of resources in the test-resources folder
    Then I can verify that testresource exists in test-resources folder

  Scenario: I want to get a single resource
    Given I have saved testresource to the test-resources folder
    Then I can verify the contents of testresource in test-resources folder

  Scenario: I want to delete a single resource
    Given I have saved testresource to the test-resources folder
    Then I can delete testresource in test-resources folder
    And I can verify that testresource does not exist in test-resources folder
