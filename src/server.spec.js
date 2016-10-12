"use strict";

let chai = require("chai");
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
            AWS.config.should.have.property("endpoint", "http://dynamodb.us-west-2.amazonaws.com");
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
            let s3RoutesSpy = sinon.spy();
            initRoutes.__set__("S3Routes", s3RoutesSpy);
            initRoutes(router);
            postsRoutesSpy.calledWithExactly(router);
            s3RoutesSpy.calledWithExactly("stepinto-io-static-resources", router);
        });
    });

    describe("server", () => {
        let expressSpy;
        let expressAppSpy;
        let server;
        let port;

        beforeEach(() => {
            port = 8080;
            process.env.PORT = port;
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

        it("should listen on process.env.PORT if database is available", () => {
            expressAppSpy.listen.calledWithExactly(port.toString()).should.equal(true);
        });
    });
});
