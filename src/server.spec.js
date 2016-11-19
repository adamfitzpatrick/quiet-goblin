"use strict";

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");
let express = require("express");

describe("application configuration", () => {
    let logger;

    beforeEach(() => {
        require("./configuration/aws-config");
        logger = require("./configuration/logging/logger");
    });

    describe("AWS configuration", () => {
        it("should set configuration parameters on AWS", () => {
            let AWS = require("aws-sdk");
            AWS.config.should.have.property("region", "us-west-2");
        });
    });

    describe("server", () => {
        let applicationMock;
        let server;
        let port;

        beforeEach(() => {
            port = 8080;
            process.env.PORT = port;
            server = rewire("./server");
            let bodyParser = {
                json: () => "bodyParserJson"
            };
            let application = express();
            applicationMock = sinon.mock(application);
            express = () => application;
            express.static = sinon.stub().returns("static");
            server.__set__("express", express);
            server.__set__("bodyParser", bodyParser);
            server.__set__("helmet", () => "helmet");
            server.__set__("CORSFilter", () => "CORSFilter");
        });

        it("should configure the application and start it", () => {
            applicationMock.expects("use").withExactArgs("helmet");
            applicationMock.expects("use").withExactArgs("bodyParserJson");
            applicationMock.expects("use").withExactArgs("static");
            applicationMock.expects("use").withExactArgs("CORSFilter");
            applicationMock.expects("use").withExactArgs("/admin", sinon.match.func);
            applicationMock.expects("use").withExactArgs("/auth", sinon.match.func);
            applicationMock.expects("use").withExactArgs("/posts", sinon.match.func);
            applicationMock.expects("use").withExactArgs("/comment", sinon.match.func);
            applicationMock.expects("use")
                .withExactArgs("/stepinto-io-static-resources", sinon.match.func);
            applicationMock.expects("listen").withExactArgs(port.toString());
            server();
            applicationMock.verify();
        });
    });
});
