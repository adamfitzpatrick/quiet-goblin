Feature: Identity and Access Management
  In order to use secure API endpoints provided by the application
  As a user, I want to be identified and authenticated
  So that I may gain access to the resources for which I have permissions

  Scenario: Create a new user account
    Given I am not currently logged in
    When I create a new account under the name 'newuser' with password 'password'
    Then I will have an access token

  Scenario: Attempt to create duplicate user account
    Given I have created an account under the name 'newuser' with password 'password'
    And I am not currently logged in
    When I attempt to create an account under the name 'newuser' with password 'password'
    Then I will not have an access token

  Scenario: Login with an existing account
    Given I have created an account under the name 'newuser' with password 'password'
    And I am not currently logged in
    When I log in under the name 'newuser' with password 'password'
    Then I will have an access token

  Scenario: Login with incorrect password
    Given I have created an account under the name 'newuser' with password 'password'
    And I am not currently logged in
    When I attempt to log in under the name 'newuser' with password 'wrongpassword'
    Then I will not have an access token

  @ignore
  Scenario: Access a secure API endpoint
    Given I have created an account under the name 'newuser' with password 'password'
    And I am logged in under the name 'newuser' with password 'password'
    Then I can post to the secure endpoint at '/auth/change-password'

  @ignore
  Scenario: Unauthorized attempt to access to secure API endpoint
    Given I have created an account under the name 'newuser' with password 'password'
    And I am logged in under the name 'newuser' with password 'password'
    Then I cannot post to the secure endpoint at '/posts'

  @ignore
  Scenario: Log out from a user account
    Given I have created an account under the name 'newuser' with password 'password'
    And I am logged in under the name 'newuser' with password 'password'
    When I log out of my account
    Then I can no longer post to the secure endpoint at '/auth/change-password'
