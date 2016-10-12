"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let S3Repository = rewire("./s3-repository");
let AWS = require("aws-sdk");
let bluebird = require("bluebird");

describe("S3Repository", () => {
    let s3Repo;
    let s3;
    let s3Mock;
    let response;

    beforeEach(() => {
        response = {
            Contents: [
                { Key: "item1" },
                { Key: "item2" },
                { Key: "folder/item3" },
                { Key: "folder/item4" }
            ]
        };
        s3 = bluebird.promisifyAll(new AWS.S3());
        s3Mock = sinon.mock(s3);
        S3Repository.__set__("s3", s3);
        s3Repo = new S3Repository("bucket");
    });

    describe("listObjects", () => {
        it("should return a list of all objects in bucket", () => {
            s3Mock.expects("listObjectsAsync").once().withExactArgs("bucket")
                .returns(Promise.resolve(response));
            return s3Repo.listObjects().should.eventually
                .eql([ "item1", "item2", "folder/item3", "folder/item4" ]);
        });
    });

    describe("listFolder", () => {
        it("should return a list of all items in specified virtual folder", () => {
            s3Mock.expects("listObjectsAsync").once().withExactArgs("bucket")
                .returns(Promise.resolve(response));
            return s3Repo.listFolder("folder").should.eventually
                .eql(["folder/item3", "folder/item4"]);
        });
    });

    describe("getObject", () => {
        it("should return a single object", () => {
            response.Contents[0].Body = new Buffer("item body");
            let params = { Bucket: "bucket", Key: "folder/item" };
            s3Mock.expects("getObjectAsync").once().withExactArgs(params)
                .returns(Promise.resolve(response.Contents[0]));
            return s3Repo.getObject("folder/item").then(data => data.toString())
                .should.eventually.equal("item body");
        });
    });

    describe("putObject", () => {
        it("should save content to s3 bucket", () => {
            let body = new Buffer("test item content");
            let params = { Bucket: "bucket", Key: "key", Body: body };
            s3Mock.expects("putObjectAsync").once().withExactArgs(params)
                .returns(Promise.resolve({ ETag: "1" }));
            return s3Repo.putObject("key", body).should.eventually.eql({ ETag: "1" });
        });
    });
});
