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
                loggerSpy.calledWithExactly("error", "Failed adding item to table null", logPayload)
                    .should.equal(true);
                err.should.equal("error");
            });

        });

        it("should log a success message on success", () => {
            expectation.returns(Promise.resolve({}));
            return repo.put(testItem).then((data) => {
                loggerSpy.calledWithExactly("info", "Added item to table null", logPayload)
                    .should.equal(true);
                data.should.equal(testItem);
            });
        });
    });

    describe("update", () => {
        let expectation;
        let params;
        let logPayload;

        beforeEach(() => {
            params = {
                TableName: null,
                Key: { id: "1" },
                UpdateExpression: "set title = :title",
                ExpressionAttributeValues: { ":title": "New title" },
                ReturnValues:"UPDATED_NEW"
            };
            logPayload = {
                repository: "Repository",
                table: null,
                operation: "update"
            };
            expectation = docClientMock.expects("updateAsync").once().withExactArgs(params);
        });

        it("should call update on the document client", () => {
            expectation.returns(Promise.resolve());
            return repo.update("1", { title: "New title" }).then((data) => {
                docClientMock.verify();
                data.should.eql({ id: "1", title: "New title" });
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.update("1", { title: "New title" }).then((err) => {
                logPayload.error = '"error"';
                loggerSpy.calledWithExactly("error", "Failed updating item 1 in table null",
                    logPayload).should.equal(true);
                err.should.equal("error");
            });
        });

        it("should log a success on success", () => {
            expectation.returns(Promise.resolve());
            return repo.update("1", { title: "New title" }).then((err) => {
                loggerSpy.calledWithExactly("info", "Updated item 1 in table null",
                    logPayload).should.equal(true);
                err.should.eql({ id: "1", title: "New title" });
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
                data.should.eql([testItem])
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.scan().then((err) => {
                logPayload.error = '"error"';
                loggerSpy.calledWithExactly("error", "Error scanning table null", logPayload)
                    .should.equal(true);
                err.should.equal("error");
            })
        });

        it("should log a success message on success", () => {
            expectation.returns(Promise.resolve({ Items: "success" }));
            return repo.scan().then((data) => {
                loggerSpy.calledWithExactly("info", "Returning all items from table null", logPayload)
                    .should.equal(true);
                data.should.equal("success");
            })
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

        it("should call scan on the document client", () => {
            expectation.returns(Promise.resolve({ Item: testItem }));
            return repo.get("1").then((data) => {
                docClientMock.verify();
                data.should.eql(testItem)
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.get("1").then((err) => {
                logPayload.error = '"error"';
                loggerSpy.calledWithExactly("error", "Error getting item 1 from table null", logPayload)
                    .should.equal(true);
                err.should.equal("error");
            })
        });

        it("should log a success message on success", () => {
            expectation.returns(Promise.resolve({ Item: "success" }));
            return repo.get("1").then((data) => {
                loggerSpy.calledWithExactly("info", "Returning item 1 from table null", logPayload)
                    .should.equal(true);
                data.should.equal("success");
            })
        });
    });
});