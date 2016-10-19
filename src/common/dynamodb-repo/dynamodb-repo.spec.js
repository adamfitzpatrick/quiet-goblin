"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");
let rewire = require("rewire");

let DynamoDBRepository = rewire("./dynamodb-repo");

describe("DynamoDBRepository", () => {
    let repo;
    let docClientMock;
    let logger;
    let testItem;

    beforeEach(() => {
        testItem = { id: "1" };
        repo = new DynamoDBRepository("table");

        docClientMock = sinon.mock(repo.docClient);

        logger = {
            info: sinon.spy(),
            error: sinon.spy(),
            warn: sinon.spy()
        };
        repo.LOGGER = logger;
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

        it("should return an error if the required item was not found", () => {
            expectation.returns(Promise.resolve({}));
            return repo.get("1").then(() => {
                return chai.assert.fail();
            }).catch(err => {
                docClientMock.verify();
                logger.error
                    .calledWithExactly("item not found", { id: "1", error: "not found" })
                    .should.equal(true);
                return err.message.should.eql("not found");
            });
        });

        it("should return log a warning if the optional item was not found", () => {
            expectation.returns(Promise.resolve({}));
            return repo.get("1", true).then(() => {
                return chai.assert.fail();
            }, () => {
                logger.warn
                    .calledWithExactly("item not found", { id: "1", error: "not found" })
                    .should.equal(true);
            });
        });

        it("should log an error on error", () => {
            expectation.returns(Promise.reject("error"));
            return repo.get("1").then(() => {
                return chai.assert.fail();
            }).catch(() => {
                return logger.error
                    .calledWithExactly("Error getting item", { error: '"error"', id: "1" })
                    .should.equal(true);
            });
        });
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
                return logger.error
                    .calledWithExactly("Error saving item", { error: '"error"', id: "1" })
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
                    Key: { id: "1" }
                });
        });

        it("should call put on client if id is not a duplicate", () => {
            getExpect.returns(Promise.resolve({}));
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
                let err = { error: "object must be unique by id", id: "1" };
                return logger.error
                    .calledWithExactly("item already exists", err)
                    .should.equal(true);
            });
        });

        it("should log an error if the an unexpected error is thrown by AWS", () => {
            getExpect.returns(Promise.reject("error"));
            return repo.putUnique(testItem).then(() => {
                chai.assert.fail();
            }, (err) => {
                let logged = { id: "1", error: '"error"' };
                logger.error.calledWithExactly("unknown error occured reading DB", logged);
                return err.message.should.equal("error");
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
});
