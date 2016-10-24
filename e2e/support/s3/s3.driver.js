"use strict";

let AWS = require("aws-sdk");
AWS.config.update({
    region: "us-west-2"
});
let bluebird = require("bluebird");
let s3 = bluebird.promisifyAll(new AWS.S3());
let baseUrl = `http://localhost:7003`;
let request = require("supertest")(baseUrl);
let path = require("path");

let supportData = require("../support-data");

let s3Driver = {
    supportData: supportData,
    saveToFolder: (bucket, testResource, testFolder) => {
        supportData.addTestResource(testResource, testFolder);
        return request.post(`/${bucket}`)
            .set("x-access-token", s3Driver.supportData.token)
            .attach("upload", path.join(__dirname, "testresource"))
            .field({ key: `${testFolder}/${testResource}` })
            .expect(response => {
                return response.body.should.have.property("ETag");
            });
    },
    deleteObject: (bucket, resource) => {
        let params = { Bucket: bucket, Key: resource };
        return s3.deleteObjectAsync(params);
    }
};

module.exports = s3Driver;
