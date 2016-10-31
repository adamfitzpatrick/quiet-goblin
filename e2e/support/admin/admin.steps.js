"use strict";

let chai = require("chai");
chai.should();

let driver = require("./admin.driver");
let request = require("supertest")("http://localhost:7003/admin");

function AdminSteps() {
    this.Then(/^I should be able to trigger a front-end deploy task$/, (done) => {
        let response = {};
        request.get("/deploy-ui/0.0.1")
            .set("x-access-token", driver.supportData.token)
            .then(data => response.status = data.status);
        setTimeout(() => {
            if (response.status) {
                chai.assert.fail();
            }
            done();
        }, 5000);
    });

    this.Then(/^I should not be able to trigger a front-end deploy task$/, () => {
        return request.get("/deploy-ui/0.0.1").expect(403);
    });

    this.After(() => {
        delete driver.supportData.token;
        return driver.deleteUsers();
    });
}

module.exports = AdminSteps;
