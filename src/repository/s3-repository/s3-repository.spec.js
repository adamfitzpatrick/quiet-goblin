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
    let logger;

    beforeEach(() => {
        response = {
            Contents: [
                { Key: "item1" },
                { Key: "item2" },
                { Key: "folder/item3" },
                { Key: "folder/item4" }
            ]
        };
        logger = {
            info: sinon.spy(),
            error: sinon.spy()
        };
        s3 = bluebird.promisifyAll(new AWS.S3());
        s3Mock = sinon.mock(s3);
        S3Repository.__set__("s3", s3);
        s3Repo = new S3Repository("bucket");
        s3Repo.LOGGER = logger;
    });

    describe("listObjects", () => {
        it("should return a list of all objects in bucket", () => {
            s3Mock.expects("listObjectsAsync").once().withExactArgs({ Bucket: "bucket" })
                .returns(Promise.resolve(response));
            return s3Repo.listObjects().should.eventually
                .eql([ "item1", "item2", "folder/item3", "folder/item4" ]);
        });

        it("should log an error if AWS responds with an error", () => {
            s3Mock.expects("listObjectsAsync").once().withExactArgs({ Bucket: "bucket" })
                .returns(Promise.reject("error"));
            return s3Repo.listObjects().then(() => {
                logger.error.calledWithExactly("Error reading bucket", { error: '"error"'})
                    .should.equal(true);
            });
        });
    });

    describe("listFolder", () => {
        it("should return a list of all items in specified virtual folder", () => {
            s3Mock.expects("listObjectsAsync").once().withExactArgs({ Bucket: "bucket" })
                .returns(Promise.resolve(response));
            return s3Repo.listFolder("folder").should.eventually
                .eql(["folder/item3", "folder/item4"]);
        });
    });

    describe("getObject", () => {
        let params;

        beforeEach(() => {
            params = { Bucket: "bucket", Key: "folder/item" };
        });

        it("should return a single object", () => {
            response.Contents[0].Body = new Buffer("item body");
            s3Mock.expects("getObjectAsync").once().withExactArgs(params)
                .returns(Promise.resolve(response.Contents[0]));
            return s3Repo.getObject("folder/item").then(data => data.toString())
                .should.eventually.equal("item body");
        });

        it("should log an error if AWS responds with an error", () => {
            s3Mock.expects("getObjectAsync").once().withExactArgs(params)
                .returns(Promise.reject("error"));
            return s3Repo.getObject("folder/item").then(() => {
                logger.error.calledWithExactly("Error getting object", { error: '"error"' });
            });
        });
    });

    describe("putObject", () => {
        let params;
        let body;

        beforeEach(() => {
            body = new Buffer("test item content");
            params = { Bucket: "bucket", Key: "key", Body: body };
        });

        it("should save content to s3 bucket", () => {
            s3Mock.expects("putObjectAsync").once().withExactArgs(params)
                .returns(Promise.resolve({ ETag: "1" }));
            return s3Repo.putObject("key", body).should.eventually.eql({ ETag: "1" });
        });

        it("should log an error if AWS responds with an error", () => {
            s3Mock.expects("putObjectAsync").once().withExactArgs(params)
                .returns(Promise.reject("error"));
            return s3Repo.putObject("key", body).then(() => {
                logger.error.calledWithExactly("Error saving item", { error: '"error"' });
            });
        });
    });

    describe("deleteObject", () => {
        let params;

        beforeEach(() => {
            params = { Bucket: "bucket", Key: "key" };
        });

        it("should remove the item from the s3 bucket", () => {
            s3Mock.expects("deleteObjectAsync").once().withExactArgs(params)
                .returns(Promise.resolve({}));
            return s3Repo.deleteObject("key").should.eventually.eql({});
        });

        it("should log an error if AWS responds with an error", () => {
            s3Mock.expects("deleteObjectAsync").once().withExactArgs(params)
                .returns(Promise.reject("error"));
            return s3Repo.deleteObject("key").then(() => {
                logger.error.calledWithExactly("Error deleting item", { error: '"error"' });
            });
        });
    });
});
