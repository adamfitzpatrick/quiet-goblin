"use strict";

let chai = require("chai");
chai.use(require("chai-as-promised"));
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let express = require("express");
let S3Routes = rewire("./s3-routes");

describe("S3Routes", () => {
    let router;
    let routerMock;
    let s3RepoMock;
    let s3Routes;

    beforeEach(() => {
        router = express();
        s3Routes = new S3Routes("bucket", router);
        s3RepoMock = sinon.mock(s3Routes.repository);
    });

    it("should set the target s3 bucket", () => {
        s3Routes.repository.bucket.should.equal("bucket");
    });

    it("should add appropriate endpoints to router", () => {
        routerMock = sinon.mock(router);

        routerMock.expects("get").once().withExactArgs("/bucket", s3Routes.getBucket);
        routerMock.expects("post").once().withExactArgs("/bucket", s3Routes.putBucket);

        s3Routes = new S3Routes("bucket", router);
        routerMock.verify();
    });

    describe("getBucket", () => {
        it("should get a listing of bucket items when passed no query", () => {
            s3RepoMock.expects("listObjects").once().withExactArgs()
                .returns(Promise.resolve(["item"]));
            let promise = s3Routes.getBucket({ query: {}, params: {}});
            s3RepoMock.verify();
            return promise.should.eventually.eql(["item"]);
        });

        it("should get a listing of folder items when passed folder query", () => {
            s3RepoMock.expects("listFolder").once().withExactArgs("/folder")
                .returns(Promise.resolve(["/folder/item"]));
            let promise = s3Routes.getBucket({ query: { folder: "/folder" }, params: {}});
            s3RepoMock.verify();
            return promise.should.eventually.eql(["/folder/item"]);
        });

        it("should get a single item contents when passed key query", () => {
            s3RepoMock.expects("getObject").once().withExactArgs("/folder/item")
                .returns(Promise.resolve("item body"));
            let promise = s3Routes.getBucket({ query: { key: "/folder/item" }, params: {}});
            s3RepoMock.verify();
            return promise.should.eventually.equal("item body");
        });
    });

    describe("putBucket", () => {
        it("should save an object to the s3 bucket", () => {
            s3RepoMock.expects("putObject").once().withExactArgs("/folder/item", "item body")
                .returns(Promise.resolve({ ETag: "1" }));
            let promise = s3Routes.putBucket({
                query: { key: "/folder/item"},
                body: "item body"
            });
            s3RepoMock.verify();
            return promise.should.eventually.eql({ ETag: "1" });
        });
    });
});
