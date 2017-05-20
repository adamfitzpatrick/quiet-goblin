"use strict";

const sinon = require("sinon");
const chai = require("chai");
chai.should();

const httpInterceptor = require("./http-interceptor");

describe("HttpInterceptor", () => {
    let request;
    let response;
    let next;

    beforeEach(() => {
        request = { baseUrl: "/base_path", headers: {}};
        response = { redirect: sinon.spy() };
        next = sinon.spy();
    });

    it(`should redirect requests forwarded from http protocol to the
    appropriate https protocol address`, () => {
        request.headers["x-forwarded-proto"] = "http";
        httpInterceptor(request, response, next);
        response.redirect.calledWithExactly("https://www.stepinto.io/base_path");
        next.notCalled.should.equal(true);
    });

    it("should not redirect requests with no forwarding protocol", () => {
        httpInterceptor(request, response, next);
        response.redirect.notCalled.should.equal(true);
        next.called.should.equal(true);
    });

    it("should not redirect requests with https forwarding protocol", () => {
        request.headers["x-forwarded-proto"] = "https";
        httpInterceptor(request, response, next);
        response.redirect.notCalled.should.equal(true);
        next.called.should.equal(true);
    });
});