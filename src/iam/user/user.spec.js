"use strict";

let chai = require("chai");
chai.should();

let User = require("./user");

describe("User", () => {
    let userObj;
    let user;

    beforeEach(() => {
        userObj = {
            username: "username",
            password: "password",
            permissions: ["permission1", "permission2"]
        };
        user = new User(userObj);
    });

    it("should have all expected properties", () => {
        user.id.should.equal(userObj.username);
        user.username.should.equal(userObj.username);
        user.password.should.equal(userObj.password);
        user.permissions.should.eql(userObj.permissions);
    });

    it("should set permissions to an empty array when the are not passed in", () => {
        delete userObj.permissions;
        user = new User(userObj);
        user.permissions.should.eql([]);
    });

    describe("checkPermission", () => {
        it("should return true if the user has the given permission", () => {
            user.checkPermission("permission1").should.equal(true);
        });

        it("should return false if the user does not have the given permission", () => {
            user.checkPermission("permission3").should.equal(false);
        });
    });

    describe("addPermission", () => {
        it("should add an additional permission to the permissions array", () => {
            user.addPermission("permission3");
            user.permissions.should.eql(["permission1", "permission2", "permission3"]);
        });
    });

    describe("removePermission", () => {
        it("should remove a permission from the permissions array", () => {
            user.removePermission("permission2");
            user.permissions.should.eql(["permission1"]);
        });

        it("should leave permissions unchanged if called with non-existent permission", () => {
            user.removePermission("not-a-permission");
            user.permissions.should.eql(userObj.permissions);
        });
    });
});
