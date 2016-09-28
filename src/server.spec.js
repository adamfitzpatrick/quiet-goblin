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

    describe("server", () => {
        let expressSpy;
        let expressAppSpy;
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

            server.__set__("express", expressSpy);
            server.__set__("initRoutes", initRoutesSpy);
            server.__set__("bodyParser", bodyParser);
            server();
        });

        it("should use bodyParser json", () => {
            expressAppSpy.use.calledWithExactly("bodyParserJson").should.equal(true);
        });

        it("should setup static source", () => {
            expressSpy.static.calledWithExactly("/public");
        });

        it("should listen on 8080 if database is available", () => {
            expressAppSpy.listen.calledWithExactly(8080).should.equal(true);
        });
    });
});