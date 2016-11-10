"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let express = require("express");
let AdminRoutes = rewire("./admin-routes");

describe("AdminRoutes", () => {
    let adminRoutes;
    let response;
    let request;
    let userRepoMock;
    let bcryptMock;

    beforeEach(() => {
        bcryptMock = sinon.mock(AdminRoutes.__get__("bcrypt"));
        let application = express();
        adminRoutes = new AdminRoutes(application);
        userRepoMock = sinon.mock(adminRoutes.userRepo);
        response = {
            status: (code) => {
                response.statusCode = code;
                return response;
            },
            json: (value) => {
                response.value = value;
                return response;
            }
        };
        request = {};
    });

    describe("changePassword", () => {
        beforeEach(() => {
            request.body = { username: "username", password: "newpassword" };
        });

        it("should change the password for the specified user", () => {
            let user = { username: "username", password: "oldpassword" };
            userRepoMock.expects("get").withExactArgs("username").returns(Promise.resolve(user));
            bcryptMock.expects("hashSync").withExactArgs("newpassword", 12)
                .returns("hashedpassword");
            userRepoMock.expects("put").withExactArgs({
                username: "username",
                password: "hashedpassword"
            }).returns(Promise.resolve(user));
            return adminRoutes.changePassword(request, response).then(response => {
                userRepoMock.verify();
                bcryptMock.verify();
                return response.statusCode.should.equal(200);
            });
        });

        it("should return bad request if the username or password is not included", () => {
            request.body = {};
            adminRoutes.changePassword(request, response);
            response.statusCode.should.equal(400);
        });

        it("should return not found if user does not exist", () => {
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.reject({ message: "not found" }));
            return adminRoutes.changePassword(request, response).then(response => {
                userRepoMock.verify();
                return response.statusCode.should.equal(404);
            });
        });
    });
});
