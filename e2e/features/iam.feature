Feature: Identity and Access Management
  I should be able to create a new user account
  I should be able to login with my account
  I should not be able to login with an incorrect password
  I should not be able to access secure endpoints unless I have permission to do so

  @ignore
  Scenario: Create a new user account
    Given I am not currently logged in
    Then I can create a new account under the name 'newuser' with password 'password'

  @ignore
  Scenario: Login with an existing account
    Given I have created an account under the name 'newuser' with password 'password'
    And I am not currently logged in
    Then I can login under the name 'newuser' with password 'password'

  @ignore
  Scenario: Login with incorrect password
    Given I have created an account under the name 'newuser' with password 'password'
    And I am not currently logged in
    Then I cannot login under the name 'newuser' with password 'wrongpassword'

  @ignore
  Scenario: Logout of an account
    Given I have created an account under the name 'newuser' with password 'password'
    Then I can login under the name 'newuser' with password 'password'
    Then I can log out of my account

  @ignore
  Scenario: Unauthorized access to secure endpoints
    Given I have created an account under the name 'newuser' with password 'password'
    Then I can login under the name 'newuser' with password 'password'
    But I cannot add a post
