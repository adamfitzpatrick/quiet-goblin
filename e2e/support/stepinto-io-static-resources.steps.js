"use strict";

let path = require("path");
let fs = require("fs");
let appConfig = require("../../app-config.json").e2e;
let baseUrl = `http://localhost:${appConfig.port}/stepinto-io-static-resources`;
let request = require("supertest")(baseUrl);

function StepIntoIOStaticResources() {
    let testItemsAdded = [];

    let addTestItem = (testResource, testFolder) => {
        let key = `${testFolder}/${testResource}`;
        if (testItemsAdded.indexOf(key) === -1) {
            testItemsAdded.push(key);
        }
    };

    this.Then(/^I ((?:can save)|(?:have saved)) ([^\s]+) to the ([^\s]+) folder$/,
        (flexibleWording, testResource, testFolder) => {
        addTestItem(testResource, testFolder);
        return request.post("/")
            .attach("upload", path.join(__dirname, "testresource"))
            .field({ key: `${testFolder}/${testResource}` })
            .expect(response => {
                return response.body.should.have.property("ETag");
            });
    });

    this.Then(/^I can verify that ([^\s]+) exists in ([^\s]+) folder$/,
        (testResource, testFolder) => {
        return request.get("/").query({ key: `${testFolder}/${testResource}`}).expect(200);
    });

    this.Then(/^I can verify the contents of ([^\s]+) in ([^\s]+) folder$/,
        (testResource, testFolder) => {
        let content = fs.readFileSync(path.join(__dirname, testResource), "utf8");
        return request.get("/").query({ key: `${testFolder}/${testResource}`}).
            expect(response => response.body.should.equal(content));
    });

    this.Then(/^I can get a list of all static resources$/, () => {
        return request.get("/").expect(200);
    });

    this.Then(/^I can get a list of resources in the ([^\s]+) folder$/, (testFolder) => {
        return request.get("/").query({ folder: testFolder }).expect(response => {
            response.body.should.have.length.above(0);
        });
    });

    this.Then(/^I can delete ([^\s]+) in ([^\s]+) folder$/, (testResource, testFolder) => {
        return request.delete("/").query({ key: `${testFolder}/${testResource}` }).expect(200);
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
        testItemsAdded.forEach(item => {
            promises.push(request.delete("/").query({ key: item }));
        });
        return Promise.all(promises);
    });
}

module.exports = StepIntoIOStaticResources;
