"use strict";

const chai = require("chai");
chai.should();

const CORSFilter = require("./cors-filter");

describe("CORSFilter", () => {
    let response;
    let request;

    beforeEach(() => {
        response = {
            headers: [],
            header: (type, value) => response.headers.push({ type: type, value: value }),
            send: (status) => response.status = status
        };
        request = { method: "OPTIONS" };
        CORSFilter()(request, response, () => {});
    });

    it("should apply CORS headers to response", () => {
        response.headers[0].should.eql({ type: "Access-Control-Allow-Origin", value: "*"});
        response.headers[1].should.eql({
            type: "Access-Control-Allow-Headers",
            value: "Origin, X-Requested-With, Content-Type, Accept"
        });
    });

    it("should reply to OPTIONS pre-flight with 200", () => {
        response.status.should.equal(200);
    });

    it("should not send status for non-OPTIONS request", () => {
        request.method = "GET";
        delete response.status;
        CORSFilter()(request, response, () => {});
        response.should.not.have.property("status");
    });
});
