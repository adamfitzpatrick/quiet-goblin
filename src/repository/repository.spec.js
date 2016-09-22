"use strict";

let chai = require("chai");
chai.use(require("chai-datetime"));
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let Repository = rewire("./repository");

describe("Repository", () => {
    let repo;
    let docClientMock;
    let loggerSpy;
    let testItem;

    beforeEach(() => {
        testItem = { id: "test_item" };
        repo = new Repository();

        docClientMock = sinon.mock(repo.docClient);

        loggerSpy = sinon.spy();
        Repository.__set__("LOGGER", { log: loggerSpy });
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
            return repo.put(testItem).then((err) => {
                logPayload.error = '"error"';
                loggerSpy.calledWithExactly("error", "Failed adding item to database", logPayload)
                    .should.equal(true);
                err.should.equal("error");
            });

        });

        it("should log an success message on success", () => {
            expectation.returns(Promise.resolve({}));
            return repo.put(testItem).then((data) => {
                loggerSpy.calledWithExactly("info", "Added item to database", logPayload)
                    .should.equal(true);
                data.should.equal(testItem);
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
            expectation.returns(Promise.resolve([testItem]));
            return repo.scan().then((data) => {
                docClientMock.verify();
                data.should.eql([testItem])
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.scan().then((err) => {
                logPayload.error = '"error"';
                loggerSpy.calledWithExactly("error", "Error scanning database", logPayload)
                    .should.equal(true);
                err.should.equal("error");
            })
        });

        it("should log an success message on success", () => {
            expectation.returns(Promise.resolve("success"));
            return repo.scan().then((data) => {
                loggerSpy.calledWithExactly("info", "Returning all items from table", logPayload)
                    .should.equal(true);
                data.should.equal("success");
            })
        });
    });
});