"use strict";

let chai = require("chai");
chai.should();

let rewire = require("rewire");
let sinon = require("sinon");
let Authenticator = rewire("./authenticator");
let secret = "secret";
let UserRepository = require("../repository/user-repository/user-repository");

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
        authenticator.userRepository = new UserRepository();
        userRepoMock = sinon.mock(authenticator.userRepository);
        jwtMock = sinon.mock(jwt);
        loggerMock = sinon.mock(authenticator.LOGGER);
        bcryptMock = sinon.mock(bcrypt);
        testUser = {
            id: "1",
            username: "username",
            password: "password",
            permissions: ["permission"]
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
                .returns(Promise.reject());
            loggerMock.expects("error")
                .withExactArgs("User already exists", { username: "username" });
            return authenticator.addUser(testUser).then(() => {
                return chai.assert.fail();
            }).catch(err => {
                userRepoMock.verify();
                bcryptMock.verify();
                loggerMock.verify();
                return err.message.should.equal("User already exists");
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
                return jwtMock.verify();
            });
        });

        it("should log an error if the password does not match", () => {
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.resolve(testUser));
            bcryptMock.expects("compareAsync").withExactArgs("wrongpassword", "password")
                .returns(Promise.resolve(false));
            loggerMock.expects("error")
                .withExactArgs("Invalid password for username", { username: "username" });
            return authenticator.verifyUser("username", "wrongpassword").then(() => {
                return chai.assert.fail();
            }).catch((err) => {
                loggerMock.verify();
                userRepoMock.verify();
                bcryptMock.verify();
                return err.should.equal("Invalid password for username");
            });
        });

        it("should log and error if the user cannot be found", () => {
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
});
