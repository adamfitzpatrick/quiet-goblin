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
        repo = new Repository("table");

        docClientMock = sinon.mock(repo.docClient);

        logger = {
            info: sinon.spy(),
            error: sinon.spy()
        };
        repo.LOGGER = logger;
    });

    describe("put", () => {
        let params;
        let expectation;

        beforeEach(() => {
            params = {
                TableName: "table",
                Item: testItem
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
                return chai.assert.fail();
            }).catch(() => {
                return logger.error.calledWithExactly("Error saving item", { error: '"error"' })
                    .should.equal(true);
            });
        });
    });

    describe("putUnique", () => {
        let params;
        let putExpect;
        let getExpect;

        beforeEach(() => {
            params = {
                TableName: "table",
                Item: testItem
            };
            putExpect = docClientMock.expects("putAsync").once().withExactArgs(params);
            getExpect = docClientMock.expects("getAsync").once()
                .withExactArgs({
                    TableName: "table",
                    Key: { id: "test_item" }
                });
        });

        it("should call put on client if id is not a duplicate", () => {
            getExpect.returns(Promise.reject({}));
            putExpect.returns(Promise.resolve({}));
            return repo.putUnique(testItem).then((post) => {
                docClientMock.verify();
                post.should.eql(testItem);
            });
        });

        it("should log an error if the id is a duplicate", () => {
            getExpect.returns(Promise.resolve({ Item: { id: "1" }}));
            putExpect.returns(Promise.resolve({}));
            return repo.putUnique(testItem).then(() => {
                chai.assert.fail();
            }).catch(() => {
                let err = { error: "object must be unique by id" };
                return logger.error.calledWithExactly("Item already exists", err)
                    .should.equal(true);
            });
        });
    });

    describe("scan", () => {
        let expectation;
        let params;

        beforeEach(() => {
            params = {
                TableName: "table"
            };
            expectation = docClientMock.expects("scanAsync").once().withExactArgs(params);
        });

        it("should call scan on the document client", () => {
            expectation.returns(Promise.resolve({ Items: [testItem] }));
            return repo.scan().then((data) => {
                docClientMock.verify();
                return data.should.eql([testItem]);
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.scan().then(() => {
                return chai.assert.fail();
            }).catch(() => {
                return logger.error
                    .calledWithExactly("Error scanning database", { error: '"error"' })
                    .should.equal(true);
            });
        });
    });

    describe("get", () => {
        let expectation;
        let params;

        beforeEach(() => {
            params = {
                TableName: "table",
                Key: { id: "1" }
            };
            expectation = docClientMock.expects("getAsync").once().withExactArgs(params);
        });

        it("should call get on the document client", () => {
            expectation.returns(Promise.resolve({ Item: testItem }));
            return repo.get("1").then((data) => {
                docClientMock.verify();
                return data.should.eql(testItem);
            });
        });

        it("should return an error if the item was not found", () => {
            expectation.returns(Promise.resolve({}));
            return repo.get("1").then(() => {
                return chai.assert.fail();
            }).catch(err => {
                docClientMock.verify();
                return err.message.should.eql("not found");
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.get("1").then(() => {
                return chai.assert.fail();
            }).catch(() => {
                return logger.error.calledWithExactly("Error getting item", { error: '"error"' })
                    .should.equal(true);
            });
        });
    });
});
