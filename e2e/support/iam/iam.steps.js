"use strict";

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();

let driver = require("./iam.driver");

function IAM() {
    this.Before(() => {
        driver.supportData.users = ["newuser"];
        return driver.cleanDynamoDbUserTable();
    });

    this.Given(/^I am not currently logged in$/, () => {
        return delete driver.supportData.token;
    });

    this.Given(/^I have created an account under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return driver.createAccount(username, password).expect(200).then(response => {
            driver.supportData.token = response.body.token;
        });
    });

    this.Given(/^I have created an account with name '([^\s]+)', password '([^\s]+)' and permission '([^\s]+)'$/, // jshint ignore:line
        (username, password, permission) => {
        return driver.createAccountWithoutApp(username, password, [permission]);
    });

    this.Given(/^I am logged in under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return driver.login(username, password).expect(200).then(response => {
            driver.supportData.token = response.body.token;
        });
    });

    this.Then(/^I create a new account under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return driver.createAccount(username, password).expect(200).then(response => {
            driver.supportData.token = response.body.token;
        });
    });

    this.Then(/^I attempt to create an account under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return driver.createAccount(username, password).expect(400).then(response => {
            response.body.should.not.have.property("token");
        });
    });

    this.Then(/^I will have an access token$/, () => {
        driver.supportData.should.have.property("token");
    });

    this.Then(/^I will not have an access token$/, () => {
        driver.supportData.should.not.have.property("token");
    });

    this.Then(/^I ((?:attempt to )?)log in under the name '([^\s]+)' with password '([^\s]+)'$/,
        (doomedToFail, username, password) => {
        return driver.login(username, password).then(response => {
            return response.status.should.equal(doomedToFail ? 401 : 200);
        });
    });

    this.Then(/^I can ((?:post to)|(?:get from)) the secure endpoint at '(.+)'$/,
        (method, endpoint) => {
        if (method === "post to") { return driver.baseRequest.post(endpoint).expect(200); }
        return driver.baseRequest.get(endpoint).expect(200);
    });

    this.Then(/^I cannot ((?:post to)|(?:get from)) the secure endpoint at '(.+)'$/,
        (method, endpoint) => {
            if (method === "post to") { return driver.baseRequest.post(endpoint).expect(403); }
            return driver.baseRequest.get(endpoint).expect(403);
    });

    this.Then(/^I can no longer ((?:post to)|(?:get from)) the secure endpoint at '(.+)'$/,
        (method, endpoint) => {
            if (method === "post to") { return driver.baseRequest.post(endpoint).expect(401); }
            return driver.baseRequest.get(endpoint).expect(401);
    });

    this.Then(/^I change the password for '([^\s]+)' from '([^\s]+)' to '([^\s]+)'$/,
        (username, oldPassword, newPassword) => {
        return driver.changePassword(username, oldPassword, newPassword).expect(200);
    });

    this.Then(/^I log out of my account$/, () => {
        return delete driver.supportData.token;
    });

    this.After(() => {
        delete driver.supportData.token;
        driver.supportData.users.push("newuser");
        return driver.cleanDynamoDbUserTable();
    });
}

module.exports = IAM;
