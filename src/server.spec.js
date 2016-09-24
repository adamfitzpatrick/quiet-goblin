"use strict";

let chai = require("chai");
chai.use(require("chai-datetime"));
chai.use(require("chai-as-promised"));
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

describe("application configuration", () => {
    let logger;

    beforeEach(() => {
        require("./configuration/aws-config");
        logger = require("./configuration/logger");
    });

    describe("logging", () => {
        it("should set logging level to info", () => {
            logger.should.have.property("level", "info");
        });
    });

    describe("AWS configuration", () => {
        it("should set configuration parameters on AWS", () => {
            let AWS = require("aws-sdk");
            AWS.config.should.have.property("region", "us-west-2");
            AWS.config.should.have.property("endpoint", "http://localhost:8000");
        });
    });

    describe("initRoutes", () => {
        let initRoutes;
        let router;

        beforeEach(() => {
            initRoutes = rewire("./configuration/init-routes");
            router = "router";
        });

        it("should configure post routes", () => {
            let postsRoutesSpy = sinon.spy();
            initRoutes.__set__("PostsRoutes", postsRoutesSpy);
            initRoutes(router);
            postsRoutesSpy.calledWithExactly(router);
        });
    });

    describe("startupHealthCheck", () => {
        let check;
        let requestSpy;
        let promise;
        let callback;

        beforeEach(() => {
            check = rewire("./configuration/startup-health-check");
            requestSpy = sinon.stub();
        });

        it("should return a promise for contacting the database server", () => {
            check().should.be.instanceOf(require("bluebird"));
        });

        it("should resolve when the database responds", () => {
            check.__set__("request", requestSpy);
            requestSpy.returns(Promise.resolve());
            return check().should.eventually.be.fullfilled;
        });

        it("should reject when the database fails to respond", () => {
            check.__set__("request", requestSpy);
            requestSpy.returns(Promise.reject());
            return check().should.eventually.be.rejected;
        })
    });

    describe("server", () => {
        let expressSpy;
        let expressAppSpy;
        let healthCheckPromise;
        let server;

        beforeEach(() => {
            server = rewire("./server");
            expressAppSpy = {
                use: sinon.spy(),
                listen: sinon.spy()
            };
            expressSpy = () => expressAppSpy;
            expressSpy.static = sinon.spy();
            let initRoutesSpy = sinon.spy();
            let bodyParser = { json: () => "bodyParserJson" };
            healthCheckPromise = new Promise(resolve => resolve());

            server.__set__("express", expressSpy);
            server.__set__("initRoutes", initRoutesSpy);
            server.__set__("bodyParser", bodyParser);
            server.__set__("startupHealthCheck", () => healthCheckPromise);
            server();
        });

        it("should use bodyParser json", () => {
            expressAppSpy.use.calledWithExactly("bodyParserJson").should.equal(true);
        });

        it("should setup static source", () => {
            expressSpy.static.calledWithExactly("/public");
        });

        it("should listen on 8080 if database is available", () => {
            return healthCheckPromise.then(() => {
                expressAppSpy.listen.calledWithExactly(8080).should.equal(true);
            });
        });

        it("should quit if database is not available", () => {
            healthCheckPromise = new Promise((resolve, reject) => reject());
            server.__set__("startupHealthCheck", () => healthCheckPromise);
            server();
            return healthCheckPromise.catch(() => {
                expressAppSpy.listen.neverCalledWith();
            });
        });
    });
});