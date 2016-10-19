"use strict";

let chai = require("chai");
chai.should();

describe("httpStatusMatcher", () => {
    let httpStatusMatcher;

    beforeEach(() => {
        httpStatusMatcher = require("./http-status-matcher");
    });

    it("should return a numeric http status code for the given string", () => {
        httpStatusMatcher("invalid password for user").should.equal(401);
    });

    it("should return 500 for non-existent status string", () => {
        httpStatusMatcher("status string which matches nothing").should.equal(500);
    });

    it("should return numeric http status code for Error", () => {
        httpStatusMatcher({ message: "invalid password for user" }).should.equal(401);
    });
});
