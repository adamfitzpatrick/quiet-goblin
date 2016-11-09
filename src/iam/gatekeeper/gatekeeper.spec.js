"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");

let rewire = require("rewire");
let jwt = require("jsonwebtoken");

let Gatekeeper = rewire("./gatekeeper");
Gatekeeper.__set__("secret", "secret");

describe("Gatekeeper", () => {
    let routeDefinitions;
    let gatekeeper;
    let jwtMock;
    let request;
    let response;
    let next;

    beforeEach(() => {
        routeDefinitions = {
            "GET_/$": { handler: sinon.spy(), permissions: [], secure: false },
            "GET_/open$": { handler: sinon.spy(), permissions: [], secure: false },
            "GET_/secure/[^/]+$": {
                handler: sinon.spy(),
                permissions: ["access_secure"],
                secure: true }
        };
        jwtMock = sinon.mock(Gatekeeper.__get__("jwt"));
        gatekeeper = new Gatekeeper(routeDefinitions);
        request = { headers: [], method: "GET" };
        response = {
            status: (code) => {
                response.statusCode = code;
                return response;
            },
            send: (data) => response.data = data,
            json: (data) => response.data = data
        };
        next = sinon.spy();
    });

    it("should reject access to an unregistered endpoint", () => {
        request.path = "/unregistered/param";
        gatekeeper.process(request, response, next);
        next.called.should.equal(false);
        response.statusCode.should.equal(404);
    });

    it("should provide access to an open endpoint without requiring a token", () => {
        request.path = "/open";
        gatekeeper.process(request, response, next);
        next.called.should.equal(true);
    });

    it("should remove a trailing slash from request url", () => {
        request.path = "/open/";
        gatekeeper.process(request, response, next);
        next.called.should.equal(true);
    });

    it("should not remove the slash if it is the only character", () => {
        request.path = "/";
        gatekeeper.process(request, response, next);
        next.called.should.equal(true);
    });

    it("should reject access to secure endpoint when token is not provided", () => {
        request.path = "/secure/param";
        gatekeeper.process(request, response, next);
        next.called.should.equal(false);
    });

    it("should reject access to secure endpoint when token is expired", () => {
        let token = jwt.sign({ permissions: ["access_secure"] }, "secret");
        jwtMock.expects("verifyAsync").withExactArgs(token, "secret")
            .returns(Promise.reject({ name: 'TokenExpiredError' }));
        request.headers = { "x-access-token": token };
        request.path = "/secure/param";
        return gatekeeper.process(request, response, next).then(() => {
            next.called.should.equal(false);
            jwtMock.verify();
            return response.statusCode.should.equal(403);
        });
    });

    it("should reject access to secure endpoint with valid token but incorrect permissions", () => {
        let token = jwt.sign({ permissions: ["none"] }, "secret");
        jwtMock.expects("verifyAsync").withExactArgs(token, "secret")
            .returns(Promise.resolve({ permissions: ["none"] }));
        request.headers = { "x-access-token": token };
        request.path = "/secure/param";
        return gatekeeper.process(request, response, next).then(() => {
            next.called.should.equal(false);
            jwtMock.verify();
            return response.statusCode.should.equal(403);
        });
    });

    it("should permit access to secure endpoint with valid token but required permissions", () => {
        let token = jwt.sign({ permissions: ["access_secure"] }, "secret");
        jwtMock.expects("verifyAsync").withExactArgs(token, "secret")
            .returns(Promise.resolve({ permissions: ["access_secure"] }));
        request.headers = { "x-access-token": token };
        request.path = "/secure/param";
        return gatekeeper.process(request, response, next).then(() => {
            next.called.should.equal(true);
            return jwtMock.verify();
        });
    });

    describe("decode", () => {
        it("should return a payload for the given token", () => {
            jwtMock.expects("decodeAsync").withExactArgs("a.b.c", "secret")
                .returns(Promise.resolve({ payload: "payload" }));
            Gatekeeper.decode("a.b.c").then((data) => data.should.eql({ payload: "payload" }));
        });
    });
});
