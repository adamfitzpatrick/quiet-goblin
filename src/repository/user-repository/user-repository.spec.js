"use strict";

let chai = require("chai");
chai.should();
let sinon = require("sinon");

let uuid = require("uuid");
let UserRepository = require("./user-repository");

describe("UserRepository", () => {
    let repo;
    let docClientMock;
    let testUser;

    beforeEach(() => {
        testUser = {
            id: uuid.v4(),
            username: "username",
            password: "password",
            permissions: ["permission"]
        };
        repo = new UserRepository();
        docClientMock = sinon.mock(repo.docClient);
    });

    describe("static properties", () => {
        it("should be configured properly", () => {
            repo.should.have.property("table", "ragingGoblin_user");
        });
    });

    describe("put", () => {
        it("should call put on the document client", () => {
            let params = {
                TableName: "ragingGoblin_user",
                Item: testUser
            };
            docClientMock.expects("putAsync").once()
                .withExactArgs(params)
                .returns(Promise.resolve(testUser));
            return repo.put(testUser).then((data) => {
                docClientMock.verify();
                data.should.eql(testUser);
            });
        });
    });

    describe("scan", () => {
        it("should call scan on the document client", () => {
            let params = { TableName: "ragingGoblin_user" };
            docClientMock.expects("scanAsync").once()
                .withExactArgs(params)
                .returns(Promise.resolve({ Items: [testUser] }));
            return repo.scan().then((data) => {
                docClientMock.verify();
                data.should.eql([testUser]);
            });
        });
    });

    describe("get", () => {
        it("should call get on the document client", () => {
            let params = {
                TableName: "ragingGoblin_user",
                Key: { id: "1" }
            };
            docClientMock.expects("getAsync").once()
                .withExactArgs(params)
                .returns(Promise.resolve({ Item: testUser }));
            return repo.get("1").then((data) => {
                docClientMock.verify();
                data.should.eql(testUser);
            });
        });
    });
});
