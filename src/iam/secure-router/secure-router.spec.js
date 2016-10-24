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
            routerMock.expects("get").withExactArgs("/route/:param", handler);
        });

        it("should make a route secure by default and configure route handler", () => {
            secureRouter.get("/route/:param", handler, { permissions: ["perm"] });
            routerMock.verify();
            secureRouter.routeDefinitions.should.have.property("GET_/route/[^/]+$");
            secureRouter.routeDefinitions["GET_/route/[^/]+$"].should.eql({
                routeString: "/route/:param",
                handler: "handler",
                permissions: ["perm"],
                secure: true
            });
        });

        it("should make a route open only when specifically requested", () => {
            secureRouter.get("/route/:param", handler, { secure: false });
            routerMock.verify();
            secureRouter.routeDefinitions["GET_/route/[^/]+$"].should.eql({
                routeString: "/route/:param",
                handler: "handler",
                permissions: void 0,
                secure: false
            });
        });

        it("should convert string permission to an array", () => {
            secureRouter.get("/route/:param", handler, { permissions: "perm" });
            routerMock.verify();
            secureRouter.routeDefinitions["GET_/route/[^/]+$"].permissions.should.eql(["perm"]);
        });
    });

    describe("post", () => {
        it("should add post route to router", () => {
            let handler = "handler";
            routerMock.expects("post").withExactArgs("/route", handler);
            secureRouter.post("/route", handler, { permissions: ["perm"] });
            secureRouter.routeDefinitions.should.have.property("POST_/route$");
            routerMock.verify();
        });
    });

    describe("delete", () => {
        it("should add delete route to router", () => {
            let handler = "handler";
            routerMock.expects("delete").withExactArgs("/route", handler);
            secureRouter.delete("/route", handler, { permissions: ["perm"] });
            secureRouter.routeDefinitions.should.have.property("DELETE_/route$");
            routerMock.verify();
        });
    });
});
