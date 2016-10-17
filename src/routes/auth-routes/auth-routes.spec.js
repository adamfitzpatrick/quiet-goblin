"use strict";

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();
let sinon = require("sinon");

let express = require("express");
let AuthRoutes = require("./auth-routes");
let User = require("../../models/user/user");

describe("AuthRoutes", () => {
    let authRoutes;
    let router;
    let routerMock;
    let authenticatorMock;
    let response;

    beforeEach(() => {
        router = express();
        routerMock = sinon.mock(router);
        authRoutes = new AuthRoutes(router);
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
        routerMock.expects("post").withExactArgs("/auth", authRoutes.getToken);
        routerMock.expects("post").withExactArgs("/auth/add-user", authRoutes.addUser);
        authRoutes = new AuthRoutes(router);
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
            authenticatorMock.expects("verifyUser").returns(Promise.reject("error"));
            return authRoutes.getToken(request, response).then((err) => {
                return err.should.equal("error");
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
            return authRoutes.addUser(request, response).then(() => {
                authenticatorMock.verify();
                return response.value.should.eql(testUser);
            });
        });
    });
});
