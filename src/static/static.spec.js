"use strict";

const chai = require("chai");
const sinon = require("sinon");

const staticHandler = require("./static");

describe("static route handler", () => {
    it("should convert any request path into a query for direct app page access", () => {
        const request = { path: "/direct" };
        const response = { redirect: sinon.spy() };
        staticHandler(request, response);
        chai.assert(response.redirect.calledWith("/?direct=direct"));
    });
});