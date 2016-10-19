"use strict";

let driver = require("./iam.driver");

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();

function IAM() {
    this.Before(() => {
        driver.supportData.users = ["newuser"];
        driver.cleanDynamoDbUserTable();
    });

    this.Given(/^I am not currently logged in$/, () => {
        if (driver.supportData.token) {
            delete driver.supportData.token;
            return driver.logout().expect(200);
        }
    });

    this.Given(/^I have created an account under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return driver.createAccount(username, password).expect(200).then(response => {
            driver.supportData.token = response.body.token;
        });
    });

    this.Given(/^I am logged in under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return driver.login(username, password);
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

    this.Then(/^I can post to the secure endpoint at '(.+)'$/, (endpoint) => {
        return driver.baseRequest(endpoint).expect(200);
    });

    this.Then(/^I cannot post to the secure endpoint at '(.+)'$/, (endpoint) => {
        return driver.baseRequest(endpoint).expect(403);
    });

    this.Then(/^I can no longer post to the secure endpoint at '(.+)'$/, (endpoint) => {
        return driver.baseRequest.post(endpoint).expect(401);
    });

    this.Then(/^I log out of my account$/, () => {
        return driver.logout().expect(200);
    });

    this.After(() => {
        delete driver.supportData.token;
        return driver.cleanDynamoDbUserTable();
    });
}

module.exports = IAM;
