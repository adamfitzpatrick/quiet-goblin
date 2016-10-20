"use strict";

let chai = require("chai");
chai.should();

let rewire = require("rewire");
let sinon = require("sinon");
let Authenticator = rewire("./authenticator");
let secret = "secret";

Authenticator.__set__("secret", secret);
let jwt = Authenticator.__get__("jwt");
let bcrypt = Authenticator.__get__("bcrypt");

describe("Authenticator", () => {
    let authenticator;
    let userRepoMock;
    let jwtMock;
    let loggerMock;
    let testUser;
    let bcryptMock;

    beforeEach(() => {
        authenticator = new Authenticator();
        userRepoMock = sinon.mock(authenticator.userRepository);
        jwtMock = sinon.mock(jwt);
        loggerMock = sinon.mock(authenticator.LOGGER);
        bcryptMock = sinon.mock(bcrypt);
        testUser = {
            id: "1",
            username: "username",
            password: "password",
            permissions: ["baseline_access", "add_comment"]
        };
    });

    describe("generateHash", () => {
        it("should return a hashed value for plain text string", () => {
            bcryptMock.expects("hashAsync").once().withExactArgs("password", 12)
                .returns(Promise.resolve("hashedpassword"));
            return authenticator.generateHash("password").then((hashed) => {
                bcryptMock.verify();
                return hashed.should.equal("hashedpassword");
            });
        });
    });

    describe("addUser", () => {
        beforeEach(() => {
            bcryptMock.expects("hashAsync").once().withExactArgs("password", 12)
                .returns(Promise.resolve("hashedpassword"));
        });

        it("should add a new user to the database with a hashed password", () => {
            userRepoMock.expects("putUnique").withExactArgs(testUser)
                .returns(Promise.resolve(testUser));
            return authenticator.addUser(testUser).then(user => {
                userRepoMock.verify();
                bcryptMock.verify();
                return user.password.should.eql("hashedpassword");
            });
        });

        it("should log an error if the user already exists", () => {
            userRepoMock.expects("putUnique").withExactArgs(testUser)
                .returns(Promise.reject({ message: "object must be unique by id" }));
            loggerMock.expects("error")
                .withExactArgs("username already exists", { username: "username" });
            return authenticator.addUser(testUser).then(() => {
                return chai.assert.fail();
            }, err => {
                userRepoMock.verify();
                loggerMock.verify();
                bcryptMock.verify();
                return err.message.should.equal("username already exists");
            });
        });

        it("should return whatever other error occurs", () => {
            userRepoMock.expects("putUnique").withExactArgs(testUser)
                .returns(Promise.reject("error"));
            return authenticator.addUser(testUser).then(() => {
                return chai.assert.fail();
            }, err => {
                userRepoMock.verify();
                bcryptMock.verify();
                return err.message.should.equal("error");
            });
        });
    });

    describe("verifyUser", () => {
        it("should return a token if the provided password matches the user's password", () => {
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.resolve(testUser));
            bcryptMock.expects("compareAsync").withExactArgs("password", "password")
                .returns(Promise.resolve(true));
            jwtMock.expects("sign").withExactArgs(testUser, secret, { expiresIn: 600000 })
                .returns("a.b.c");
            return authenticator.verifyUser("username", "password").then((token) => {
                token.should.equal("a.b.c");
                userRepoMock.verify();
                bcryptMock.verify();
                authenticator.activeTokens.should.eql(["a.b.c"]);
                return jwtMock.verify();
            });
        });

        it("should log an error if the password does not match", () => {
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.resolve(testUser));
            bcryptMock.expects("compareAsync").withExactArgs("wrongpassword", "password")
                .returns(Promise.resolve(false));
            loggerMock.expects("error")
                .withExactArgs("invalid password for username", { username: "username" });
            return authenticator.verifyUser("username", "wrongpassword").then(() => {
                return chai.assert.fail();
            }, err => {
                userRepoMock.verify();
                loggerMock.verify();
                bcryptMock.verify();
                authenticator.activeTokens.should.eql([]);
                return err.message.should.equal("invalid password for username");
            });
        });

        it("should log an error if the user cannot be found", () => {
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.reject("User not found"));
            loggerMock.expects("error").withExactArgs("User not found", { username: "username" });
            return authenticator.verifyUser("username", "password").then(() => {
                chai.assert.fail();
            }).catch(() => {
                loggerMock.verify();
                return userRepoMock.verify();
            });
        });
    });

    describe("deverifyUser", () => {
        beforeEach(() => {
            authenticator.activeTokens = ["a.b.c"];
        });

        it("should remove user token from list of active tokens", () => {
            jwtMock.expects("decode").withExactArgs("a.b.c").returns({ username: "username" });
            authenticator.deverifyUser("a.b.c").should.eql({ username: "username" });
            authenticator.activeTokens.should.eql([]);
            jwtMock.verify();
        });

        it("should not attempt to remove a token that doesn't exist", () => {
            authenticator.deverifyUser("not.a.token");
            authenticator.activeTokens.should.eql(["a.b.c"]);
        });
    });
});
