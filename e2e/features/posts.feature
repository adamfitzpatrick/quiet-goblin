Feature: Posts
  I should be able to view all posts
  I should be able to retrieve a single post
  I should be able to save a post if I have the required permissions
  I should be able to update an existing post if I have the required permissions

  Scenario: View posts
    Given I am not currently logged in
    Then I want to retrieve a listing of all posts

  Scenario: Retrieve a single post
    Given I am not currently logged in
    Then I want to retrieve a single post

  Scenario: Save a post
    Given I have created an account with name 'username', password 'password' and permission 'write_post'
    And I am logged in under the name 'username' with password 'password'
    And I have a post I wish to save
    When I save the post to the database
    Then I can verify the post I just saved

  Scenario: Update a post
    Given I have created an account with name 'username', password 'password' and permission 'write_post'
    And I am logged in under the name 'username' with password 'password'
    And I have a post I wish to save
    When I save the post to the database
    Then I can update the post I just saved
    And I can verify the post I just updated
