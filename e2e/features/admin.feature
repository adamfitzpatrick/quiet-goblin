Feature: Administration
  I should be able to trigger a front-end deployment if I have the deploy_ui permission
  I should not be able to trigger a front-end deployment if I don't have the deploy_ui permission

Scenario:
  Given I have created an account with name 'username', password 'password' and permission 'deploy_ui'
  And I am logged in under the name 'username' with password 'password'
  Then I should be able to trigger a front-end deploy task

Scenario:
  Given I have created an account under the name 'newuser' with password 'password'
  And I am logged in under the name 'username' with password 'password'
  Then I should not be able to trigger a front-end deploy task
