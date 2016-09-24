"use strict";

let chai = require("chai");
chai.use(require("chai-datetime"));
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let PostsRepository = require("./posts-repository");

describe("PostsRepository", () => {
    let repo;
    let docClientMock;
    let testPost;

    beforeEach(() => {
        testPost = { title: "Test Post" };
        repo = new PostsRepository();
        docClientMock = sinon.mock(repo.docClient);
    });

    describe("static properties", () => {
        it("should be configured properly", () => {
            repo.should.have.property("table", "ragingGoblinPosts");
        });
    });

    describe("put", () => {
        it("should call put on the document client", () => {
            let params = {
                TableName: "ragingGoblinPosts",
                Item: testPost
            };
            docClientMock.expects("putAsync").once()
                .withExactArgs(params)
                .returns(Promise.resolve(testPost));
            return repo.put(testPost).then((data) => {
                docClientMock.verify();
                data.should.eql(testPost);
            });
        });
    });

    describe("update", () => {
        it("should call update on the document client", () => {
            let params = {
                TableName: "ragingGoblinPosts",
                Key: { id: "1" },
                UpdateExpression: "set title = :title",
                ExpressionAttributeValues: { ":title": "New title" },
                ReturnValues:"UPDATED_NEW"
            };
            docClientMock.expects("updateAsync").once()
                .withExactArgs(params)
                .returns(Promise.resolve({ id: "1", title: "New title" }));
            return repo.update("1", { title: "New title" }).then((data) => {
                docClientMock.verify();
                data.should.eql({ id: "1", title: "New title" });
            });
        });
    });

    describe("scan", () => {
        it("should call scan on the document client", () => {
            let params = { TableName: "ragingGoblinPosts" };
            docClientMock.expects("scanAsync").once()
                .withExactArgs(params)
                .returns(Promise.resolve({ Items: [testPost] }));
            return repo.scan().then((data) => {
                docClientMock.verify();
                data.should.eql([testPost]);
            });
        });
    });
});