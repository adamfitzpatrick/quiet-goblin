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
        response = {
            cookies: [],
            status: (code) => {
                response.statusCode = code;
                return response;
            },
            json: (value) => response.value = value,
            cookie: (name, value, options) =>  {
                response.cookies.push({
                    name: name,
                    value: value,
                    options: options
                });
                return response;
            },
            end: () => {}
        };
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
            return authRoutes.getToken(request, response).then(() => {
                authenticatorMock.verify();
                let cookie = response.cookies[0];
                cookie.name.should.equal("stepinto.io.token");
                cookie.value.should.equal("a.b.c");
                return cookie.options.should.eql({
                    secure: true,
                    domain: "http://www.stepinto.io"
                });
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
                body: { oldPassword: "oldpassword", newPassword: "newpassword" },
                headers: { "x-access-token": "a.b.c" }
            };
        });

        it("should update the user's password", () => {
            authenticatorMock.expects("changePassword")
                .withExactArgs("a.b.c", "oldpassword", "newpassword")
                .returns(Promise.resolve());
            return authRoutes.changePassword(request, response).then(() => {
                authenticatorMock.verify();
                return response.statusCode.should.eql(200);
            });
        });

        it("should return an error status code if the password cannot be changed", () => {
            authenticatorMock.expects("changePassword")
                .withExactArgs("a.b.c", "oldpassword", "newpassword")
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

    describe("logout", () => {
        it("should log the user out", () => {
            authenticatorMock.expects("deverifyUser").withExactArgs("a.b.c")
                .returns({ username: "username" });
            let request = { headers: { "x-access-token": "a.b.c" }};
            authRoutes.logout(request, response);
            authenticatorMock.verify();
            return response.statusCode.should.eql(200);
        });

        it("should return 400 code if user is not logged in", () => {
            authenticatorMock.expects("deverifyUser").withExactArgs("a.b.c");
            let request = { headers: { "x-access-token": "a.b.c" }};
            authRoutes.logout(request, response);
            authenticatorMock.verify();
            return response.statusCode.should.eql(400);
        });
    });
});
