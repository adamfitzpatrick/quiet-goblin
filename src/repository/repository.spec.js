"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let Repository = rewire("./repository");

describe("Repository", () => {
    let repo;
    let docClientMock;
    let logger;
    let testItem;

    beforeEach(() => {
        testItem = { id: "test_item" };
        repo = new Repository();

        docClientMock = sinon.mock(repo.docClient);

        logger = {
            info: sinon.spy(),
            error: sinon.spy()
        };
        repo.LOGGER = logger;
    });

    describe("put", () => {
        let params;
        let logPayload;
        let expectation;

        beforeEach(() => {
            params = {
                TableName: null,
                Item: testItem
            };
            logPayload = {
                repository: "Repository",
                table: null,
                operation: "put"
            };
            expectation = docClientMock.expects("putAsync").once().withExactArgs(params);
        });

        it("should call put on the document client", () => {
            expectation.returns(Promise.resolve({}));
            return repo.put(testItem).then((post) => {
                docClientMock.verify();
                post.should.eql(testItem);
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.put(testItem).then(() => {
                logger.error.calledWithExactly("Error saving item", { error: '"error"' })
                    .should.equal(true);
            });
        });
    });

    describe("scan", () => {
        let expectation;
        let params;
        let logPayload;

        beforeEach(() => {
            params = {
                TableName: null
            };
            logPayload = {
                repository: "Repository",
                table: null,
                operation: "scan"
            };
            expectation = docClientMock.expects("scanAsync").once().withExactArgs(params);
        });

        it("should call scan on the document client", () => {
            expectation.returns(Promise.resolve({ Items: [testItem] }));
            return repo.scan().then((data) => {
                docClientMock.verify();
                data.should.eql([testItem]);
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.scan().then(() => {
                logger.error.calledWithExactly("Error scanning database", { error: '"error"' })
                    .should.equal(true);
            });
        });
    });

    describe("get", () => {
        let expectation;
        let params;
        let logPayload;

        beforeEach(() => {
            params = {
                TableName: null,
                Key: { id: "1" }
            };
            logPayload = {
                repository: "Repository",
                table: null,
                operation: "get"
            };
            expectation = docClientMock.expects("getAsync").once().withExactArgs(params);
        });

        it("should call get on the document client", () => {
            expectation.returns(Promise.resolve({ Item: testItem }));
            return repo.get("1").then((data) => {
                docClientMock.verify();
                data.should.eql(testItem);
            });
        });

        it("should return 404 if the item was not found", () => {
            expectation.returns(Promise.resolve({}));
            return repo.get("1").then((data) => {
                docClientMock.verify();
                data.should.eql({ status: 404, cause: "not found" });
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.get("1").then(() => {
                logger.error.calledWithExactly("Error getting item", { error: '"error"' })
                    .should.equal(true);
            });
        });
    });
});
