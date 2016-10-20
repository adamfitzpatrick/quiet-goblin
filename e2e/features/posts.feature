Feature: Posts
  I should be able to view all posts
  I should be able to save a post
  I should be able to retrieve a single post
  I should be able to update an existing post

  Scenario: View posts
    Given I have created an account under the name 'newuser' with password 'password'
    And I am logged in under the name 'newuser' with password 'password'
    Then I want to retrieve a listing of all posts

  Scenario: Save a post
    Given I have a post I wish to save
    And I can save the post to the database
    Then I can verify the post I just saved

  Scenario: Update a post
    Given I have a post I wish to save
    And I can save the post to the database
    Then I can update the post I just saved
    And I can verify the post I just updated
