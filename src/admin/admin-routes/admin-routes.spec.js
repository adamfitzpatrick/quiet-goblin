"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let express = require("express");
let AdminRoutes = rewire("./admin-routes");

describe("AdminRoutes", () => {
    let application;
    let adminRoutes;
    let childProcessMock;
    let request;
    let response;
    let deployTask;

    beforeEach(() => {
        request = { params: { tag: "0.0.1" }};
        response = {
            data: "",
            write: (data) => response.data += data,
            status: (code) => {
                response.statusCode = code;
                return response;
            },
            end: sinon.spy()
        };
        deployTask = {
            stdout: { on: (event, cb) => cb(event) },
            on: (event, cb) => {
                deployTask.event = event;
                cb(deployTask.code);
            },
            code: 0
        };
        application = express();
        adminRoutes = new AdminRoutes(application);
        childProcessMock = sinon.mock(AdminRoutes.__get__("childProcess"));
    });

    describe("deployUIApp", () => {
        it("should pull github and deploy the application", () => {
            childProcessMock.expects("spawn")
                .withExactArgs("sh", sinon.match.array, sinon.match.object)
                .returns(deployTask);
            adminRoutes.deployUIApp(request, response);
            childProcessMock.verify();
            response.statusCode.should.equal(200);
            response.data.should.equal("data");
            response.end.called.should.equal(true);
        });

        it("should return a server error if the deploy script fails", () => {
            childProcessMock.expects("spawn")
                .withExactArgs("sh", sinon.match.array, sinon.match.object)
                .returns(deployTask);
            deployTask.code = 1;
            adminRoutes.deployUIApp(request, response);
            childProcessMock.verify();
            response.statusCode.should.equal(500);
        });
    });
});
