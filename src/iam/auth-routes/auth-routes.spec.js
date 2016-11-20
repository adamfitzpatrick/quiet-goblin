"use strict";

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let express = require("express");
let AuthRoutes = rewire("./auth-routes");
let User = require("../user/user");

describe("AuthRoutes", () => {
    let authRoutes;
    let application;
    let authenticatorMock;
    let response;

    beforeEach(() => {
        application = express();
        authRoutes = new AuthRoutes(application);
        authenticatorMock = sinon.mock(authRoutes.authenticator);
        let Response = function () {
            this.status = (code) => {
                this.statusCode = code;
                return this;
            };
            this.json = (value) => this.value = value;
        };
        response = new Response();
    });

    describe("getToken", () => {
        let request;

        beforeEach(() => {
            request = {
                body: {
                    username: "username",
                    password: "password"
                }
            };
        });

        it("should return a token for a valid user", () => {
            authenticatorMock.expects("verifyUser").returns(Promise.resolve("a.b.c"));
            return authRoutes.getToken(request, response).then((data) => {
                authenticatorMock.verify();
                data.should.have.property("token", "a.b.c");
                return response.value.should.eql({ token: "a.b.c" });
            });
        });

        it("should return an error if token cannot be provided", () => {
            authenticatorMock.expects("verifyUser")
                .returns(Promise.reject("invalid password for user"));
            return authRoutes.getToken(request, response).then((err) => {
                response.statusCode.should.equal(401);
                return err.should.equal("invalid password for user");
            });
        });
    });

    describe("addUser", () => {
        let testUser;
        let request;

        beforeEach(() => {
            testUser = new User({
                username: "username",
                password: "password"
            });
            request = {
                body: testUser
            };
        });

        it("should save a new user if username is not already taken", () => {
            authenticatorMock.expects("addUser").withExactArgs(testUser)
                .returns(Promise.resolve(testUser));
            authenticatorMock.expects("verifyUser").withExactArgs("username", "password")
                .returns(Promise.resolve("a.b.c"));
            return authRoutes.addUser(request, response).then(() => {
                authenticatorMock.verify();
                return response.value.should.eql({ token: "a.b.c" });
            });
        });

        it("should return an error message if username already exists", () => {
            authenticatorMock.expects("addUser").withExactArgs(testUser)
                .returns(Promise.reject("username already exists"));
            return authRoutes.addUser(request, response).then(() => {
                authenticatorMock.verify();
                response.value.should.eql("username already exists");
                return response.statusCode.should.eql(400);
            });
        });
    });

    describe("changePassword", () => {
        let request;

        beforeEach(() => {
            request = {
                body: {
                    username: "username",
                    oldPassword: "oldpassword",
                    newPassword: "newpassword"
                },
                headers: { "Authorization": "a.b.c" }
            };
        });

        it("should update the user's password", () => {
            authenticatorMock.expects("changePassword")
                .withExactArgs("username", "oldpassword", "newpassword")
                .returns(Promise.resolve());
            return authRoutes.changePassword(request, response).then(() => {
                authenticatorMock.verify();
                return response.statusCode.should.eql(200);
            });
        });

        it("should return an error status code if the password cannot be changed", () => {
            authenticatorMock.expects("changePassword")
                .withExactArgs("username", "oldpassword", "newpassword")
                .returns(Promise.reject({ message: "error" }));
            return authRoutes.changePassword(request, response).then(() => {
                authenticatorMock.verify();
                return response.statusCode.should.eql(500);
            });
        });

        it("should return bad request error if password info is missing", () => {
            request.body = {};
            authRoutes.changePassword(request, response);
            response.statusCode.should.eql(400);
        });
    });
});
