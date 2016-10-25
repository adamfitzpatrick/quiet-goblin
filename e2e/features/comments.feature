Feature: Comments
  I should be able to view all comments
  I should be able to view a single comment
  I should be able to save a comment if I have the required permissions
  I should be able to update an existing comment if I have the required permissions

Scenario:
  Given I am not currently logged in
  Then I can view all comments

Scenario:
  Given I am not currently logged in
  Then I can view a single comment

Scenario:
  Given I have created an account with name 'username', password 'password' and permission 'read_comment'
  And I am logged in under the name 'username' with password 'password'
  When I attempt to save a comment to the database
  Then the comment is not saved

Scenario:
  Given I have created an account with name 'username', password 'password' and permission 'write_comment'
  And I am logged in under the name 'username' with password 'password'
  When I save a comment to the database
  Then I can verify the comment I just saved

Scenario:
  Given I have created an account with name 'username', password 'password' and permission 'write_comment'
  And I am logged in under the name 'username' with password 'password'
  When I update an existing comment
  Then I can verify the comment I just updated

Scenario:
  Given I have created an account with name 'username', password 'password' and permission 'read_comment'
  And I am logged in under the name 'username' with password 'password'
  When I attempt to update an existing comment
  Then the comment is not updated
