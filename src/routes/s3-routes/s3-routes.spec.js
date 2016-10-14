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
    let Response;
    let response;

    beforeEach(() => {
        router = express();
        s3Routes = new S3Routes("bucket", router);
        s3RepoMock = sinon.mock(s3Routes.repository);
        Response = function () {
            let _this = this;
            this.json = (data) => _this.value = data;
            this.promise = new Promise((resolve) => {
                let timeout = setInterval(() => {
                    if (_this.value) {
                        resolve(_this.value);
                        clearInterval(timeout);
                    }
                });
            });
        };
        response = new Response();
    });

    it("should set the target s3 bucket", () => {
        s3Routes.repository.bucket.should.equal("bucket");
    });

    it("should add appropriate endpoints to router", () => {
        routerMock = sinon.mock(router);

        routerMock.expects("get").once().withExactArgs("/bucket", s3Routes.getBucket);
        routerMock.expects("post").once()
            .withExactArgs("/bucket", sinon.match.func, s3Routes.putObject);

        s3Routes = new S3Routes("bucket", router);
        routerMock.verify();
    });

    describe("getBucket", () => {
        it("should get a listing of bucket items when passed no query", () => {
            s3RepoMock.expects("listObjects").once().withExactArgs()
                .returns(Promise.resolve(["item"]));
            s3Routes.getBucket({ query: {}, params: {}}, response);
            s3RepoMock.verify();
            return response.promise.should.eventually.eql(["item"]);
        });

        it("should get a listing of folder items when passed folder query", () => {
            s3RepoMock.expects("listFolder").once().withExactArgs("/folder")
                .returns(Promise.resolve(["/folder/item"]));
            s3Routes.getBucket({ query: { folder: "/folder" }, params: {}}, response);
            s3RepoMock.verify();
            return response.promise.should.eventually.eql(["/folder/item"]);
        });

        it("should get a single item contents when passed key query", () => {
            s3RepoMock.expects("getObject").once().withExactArgs("/folder/item")
                .returns(Promise.resolve("item body"));
            s3Routes.getBucket({ query: { key: "/folder/item" }, params: {}}, response);
            s3RepoMock.verify();
            return response.promise.should.eventually.equal("item body");
        });
    });

    describe("putObject", () => {
        it("should save an object to the s3 bucket", () => {
            s3RepoMock.expects("putObject").once().withExactArgs("/folder/item", "item body")
                .returns(Promise.resolve({ ETag: "1" }));
            s3Routes.putObject({
                body: { key: "/folder/item" },
                file: { buffer: "item body" }
            }, response);
            s3RepoMock.verify();
            return response.promise.should.eventually.eql({ ETag: "1" });
        });
    });

    describe("deleteObject", () => {
        it("should delete an object from the s3 bucket", () => {
            s3RepoMock.expects("deleteObject").once().withExactArgs("/folder/item")
                .returns(Promise.resolve({}));
            s3Routes.deleteObject({ query: { key: "/folder/item" }}, response);
            s3RepoMock.verify();
            return response.promise.should.eventually.eql({});
        });
    });
});
