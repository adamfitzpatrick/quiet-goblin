Feature: Admin

  As an administrator, I can change the password for any user

Scenario:
  Given I have created an account under the name 'newuser' with password 'password'
  And I am logged in as an administrator
  When I change the password for 'newuser' to 'newpassword'
  When I log in under the name 'newuser' with password 'newpassword'
  Then I will have an access token
