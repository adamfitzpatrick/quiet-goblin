"use strict";

let testTools = require("../setup/test-tools");
let request = testTools.request;
let getUrl = testTools.getUrl;

describe("post routes", () => {
    before(() => {
        return testTools.initialize();
    });

    describe("get /posts", () => {
        it("should return all posts", () => {
            return request.get(getUrl("/posts")).should.eventually.have.length(2);
        });
    });

    describe("get /posts/postId", () => {
        it("should return a single post", () => {
            return request.get(getUrl("/posts/57dbacc53250166224c0fcdf"))
                .should.eventually.have.property("_id", "57dbacc53250166224c0fcdf");
        });
    });
});