"use strict";

let testTools = require("../setup/test-tools");
let request = testTools.request;
let getUrl = testTools.getUrl;

describe("health routes", () => {
    describe("get /", () => {
        it("should return status OK", () => {
            return request.get(getUrl("/")).should.eventually.eql({ status: "OK" });
        });
    });
});