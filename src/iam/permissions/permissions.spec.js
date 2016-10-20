"use strict";

let chai = require("chai");
chai.should();
let expect = chai.expect;

describe("permissions", () => {
    let permissions;

    beforeEach(() => {
        permissions = require("./permissions");
    });

    it("should return the permission string for a valid permission", () => {
        permissions.read_post.should.equal("read_post");
    });

    it("should return undefined for a permission that does not exist", () => {
        expect(permissions.not_a_permission).to.equal(void 0);
    });

    describe("level", () => {
        it("should return an array of permissions for a given access level", () => {
            let perms = ["add_user", "read_comment", "read_post"];
            permissions.level(0).should.eql(perms);
        });
    });
});
