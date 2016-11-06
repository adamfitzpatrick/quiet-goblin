"use strict";

let path = require("path");
let fs = require("fs");
let baseUrl = `http://localhost:7003/stepinto-io-static-resources`;
let request = require("supertest")(baseUrl);

let bucket = "stepinto-io-static-resources";
let driver = require("./s3.driver");

function StepIntoIOStaticResources() {
    this.Then(/^I ((?:can save)|(?:have saved)) ([^\s]+) to the ([^\s]+) folder$/,
        (flexibleWording, testResource, testFolder) => {
        return driver.saveToFolder(bucket, testResource, testFolder);
    });

    this.Then(/^I can verify that ([^\s]+) exists in ([^\s]+) folder$/,
        (testResource, testFolder) => {
        return request.get("/").query({ key: `${testFolder}/${testResource}`}).expect(200);
    });

    this.Then(/^I can verify the contents of ([^\s]+) in ([^\s]+) folder/,
        (testResource, testFolder) => {
        let content = fs.readFileSync(path.join(__dirname, testResource), "utf8");
        return request.get("/").query({ key: `${testFolder}/${testResource}`}).
            expect(response => {
                if (response.body.data) {
                    return Buffer.from(response.body.data).toString().should.equal(content);
                }
                return response.body.should.equal(content);
        });
    });

    this.Then(/^I can get a list of all static resources$/, () => {
        return request.get("/").expect(200);
    });

    this.Then(/^I can get a list of resources in the ([^\s]+) folder/, (testFolder) => {
        return request.get("/").query({ folder: testFolder }).expect(response => {
            response.body.should.have.length.above(0);
        });
    });

    this.Then(/^I can delete ([^\s]+) in ([^\s]+) folder$/, (testResource, testFolder) => {
        return request.delete("/").set("x-access-token", driver.supportData.token)
            .query({ key: `${testFolder}/${testResource}` })
            .expect(200);
    });

    this.Then(/^I can verify that ([^\s]+) does not exist in ([^\s]+) folder$/,
        (testResource, testFolder) => {
        return request.get("/").query({ folder: testFolder }).expect(response => {
            return response.body.every(item => item !== `${testFolder}/${testResource}`)
                .should.equal(true);
        });
    });

    this.After(() => {
        let promises = [];
        driver.supportData.testResources.forEach(item => {
            promises.push(driver.deleteObject(bucket, item));
        });
        return Promise.all(promises);
    });
}

module.exports = StepIntoIOStaticResources;
