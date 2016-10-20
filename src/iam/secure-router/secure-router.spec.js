"use strict";

const chai = require("chai");
chai.should();
const sinon = require("sinon");

let express = require("express");

const SecureRouter = require("./secure-router");


describe("SecureRouter", () => {
    let secureRouter;
    let application;
    let applicationMock;
    let routerMock;

    beforeEach(() => {
        application = express();
        secureRouter = new SecureRouter(application, "/");
        routerMock = sinon.mock(secureRouter.router);
    });

    it("should require the application to use this router", () => {
        applicationMock = sinon.mock(application);
        applicationMock.expects("use").withExactArgs("/", sinon.match.func);
        secureRouter = new SecureRouter(application, "/");
        applicationMock.verify();
    });

    describe("get", () => {
        let handler;

        beforeEach(() => {
            handler = "handler";
            routerMock.expects("get").withExactArgs("/route", handler);
        });

        it("should make a route secure by default and configure route handler", () => {
            secureRouter.get("/route", handler, { permissions: ["perm"] });
            routerMock.verify();
            secureRouter.routeDefinitions.should.have.property("/route");
            secureRouter.routeDefinitions["/route"].should.eql({
                routeString: "/route",
                handler: "handler",
                permissions: ["perm"],
                secure: true
            });
        });

        it("should make a route open only when specifically requested", () => {
            secureRouter.get("/route", handler, { secure: false });
            routerMock.verify();
            secureRouter.routeDefinitions["/route"].should.eql({
                routeString: "/route",
                handler: "handler",
                permissions: void 0,
                secure: false
            });
        });

        it("should convert string permission to an array", () => {
            secureRouter.get("/route", handler, { permissions: "perm" });
            routerMock.verify();
            secureRouter.routeDefinitions["/route"].permissions.should.eql(["perm"]);
        });
    });

    describe("post", () => {
        it("should add post route to router", () => {
            let handler = "handler";
            routerMock.expects("post").withExactArgs("/route", handler);
            secureRouter.post("/route", handler, { permissions: ["perm"] });
            routerMock.verify();
        });
    });
});
