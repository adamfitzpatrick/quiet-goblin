"use strict";

let appConfig = require("../../app-config.json").e2e;
let baseUrl = `http://localhost:${appConfig.port}`;
let request = require("supertest")(`${baseUrl}/auth`);
let postRequest = require("supertest")(`${baseUrl}/posts`);

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();

let supportData = {};

let createAccount = (username, password) => {
    return request.post("/add-user").send({ username: username, password: password });
};

let login = (username, password) => {
    return request.post("/").send({ username: username, password: password });
};

let logout = () => { return request.post("/logout").send({ token: supportData.token }); };

function IAM() {
    this.Given(/^I am not currently logged in$/, () => {
        if (supportData.token) { return logout().expect(200); }
    });

    this.Given(/^I have created an account under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return createAccount(username, password).expect(200).then(response => {
            supportData.token = response.body.token;
        });
    });

    this.Then(/^I can create a new account under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return createAccount(username, password).expect(200);
    });

    this.Then(/^I can login under the name '([^\s]+)' with password '([^\s]+)'$/,
        (username, password) => {
        return login(username, password).expect(response => {
                response.body.should.have.property("token");
                supportData.token = response.body.token;
                return response.status(200);
            });
    });

    this.Then(/^I cannot login under the name '([^\s]+)' with ([^\s]+) '([^\s]+)'$/,
        (username, password) => {
        return login(username, password).expect(401);
    });

    this.Then(/^I can log out of my account$/, () => {
        return logout().expect(200);
    });

    this.Then(/^I cannot add a post$/, () => {
        return postRequest.post("/")
            .send({ title: "unauthorized post"}).expect(401).then(() => {
                return postRequest.get("/").then(response => {
                    return response.body.some(post => post.title === "unauthorized post")
                        .should.equal(false);
                });
            });
    });
}

module.exports = IAM;
