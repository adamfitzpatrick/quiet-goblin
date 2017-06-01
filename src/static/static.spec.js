"use strict";

const chai = require("chai");
chai.should();
const sinon = require("sinon");

const staticHandler = require("./static");

describe("static route handler", () => {
    let request;
    let response;
    let next;

    beforeEach(() => {
        request = { path: "/direct" };
        response = { redirect: sinon.spy() };
        next = sinon.spy();
    });

    it("should convert any request path into a query for direct app page access", () => {
        staticHandler(request, response, next);
        response.redirect.calledWith("/?direct=direct").should.equal(true);
        next.notCalled.should.equal(true);
    });

    it("pass on a request for the root path unchanged", () => {
        request.path = "/";
        staticHandler(request, response, next);
        response.redirect.notCalled.should.equal(true);
        next.called.should.equal(true);
    });
});