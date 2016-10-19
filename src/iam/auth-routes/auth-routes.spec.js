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
    let router;
    let routerMock;
    let authenticatorMock;
    let response;

    beforeEach(() => {
        application = express();
        authRoutes = new AuthRoutes(application);
        router = express.Router();
        routerMock = sinon.mock(router);
        AuthRoutes.__set__("express", { Router: () => router });
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

    it("should set required routes", () => {
        routerMock.expects("post").withExactArgs("/", authRoutes.getToken);
        routerMock.expects("post").withExactArgs("/add-user", authRoutes.addUser);
        routerMock.expects("post").withExactArgs("/logout", authRoutes.logout);
        authRoutes = new AuthRoutes(application);
        routerMock.verify();
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

    describe("logout", () => {
        it("should log the user out", () => {
            authenticatorMock.expects("deverifyUser").withExactArgs("a.b.c");
            let request = { headers: { "x-access-token": "a.b.c" }};
            authRoutes.logout(request, response);
            authenticatorMock.verify();
            return response.statusCode.should.eql(200);
        });
    });
});
