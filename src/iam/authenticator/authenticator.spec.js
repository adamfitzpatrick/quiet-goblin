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
            bcryptMock.expects("hashSync").once().withExactArgs("password", 12)
                .returns("hashedpassword");
            authenticator.generateHash("password").should.equal("hashedpassword");
            bcryptMock.verify();
        });
    });

    describe("addUser", () => {
        beforeEach(() => {
            bcryptMock.expects("hashSync").once().withExactArgs("password", 12)
                .returns("hashedpassword");
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

    describe("changePassword", () => {
        let updatedUser;

        beforeEach(() => {
            updatedUser = JSON.parse(JSON.stringify(testUser));
            updatedUser.password = "newpassword";
        });

        it("should update the user's password", () => {
            jwtMock.expects("decode").withExactArgs("a.b.c").returns({ username: "username" });
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.resolve(testUser));
            bcryptMock.expects("compareSync").withExactArgs("oldpassword", "password")
                .returns(true);
            bcryptMock.expects("hashSync").withExactArgs("newpassword", 12).returns("newpassword");
            userRepoMock.expects("put").withExactArgs(updatedUser)
                .returns(Promise.resolve(updatedUser));
            return authenticator.changePassword("a.b.c", "oldpassword", "newpassword")
                .then(() => {
                    jwtMock.verify();
                    userRepoMock.verify();
                    bcryptMock.verify();
                })
                .catch(() => {
                    jwtMock.verify();
                    userRepoMock.verify();
                    bcryptMock.verify();
                    return chai.assert.fail();
                });
        });

        it("should throw an error if the token is impropertly formatted", () => {
            jwtMock.expects("decode").withExactArgs("a.b.c").returns({});
            (() => authenticator.changePassword("a.b.c", "oldpassword", "newpassword"))
                .should.throw("invalid access token");
            jwtMock.verify();
        });

        it("should throw an error if the user cannot be found", () => {
            jwtMock.expects("decode").withExactArgs("a.b.c").returns({ username: "username" });
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.reject("not found"));
            return authenticator.changePassword("a.b.c", "oldpassword", "newpassword")
                .then(() => {
                    jwtMock.verify();
                    userRepoMock.verify();
                    return chai.assert.fail();
                }).catch((err) => {
                    jwtMock.verify();
                    userRepoMock.verify();
                    return err.message.should.eql("not found");
                });
        });

        it("should throw an error if the old password is incorrect", () => {
            jwtMock.expects("decode").withExactArgs("a.b.c").returns({ username: "username" });
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.resolve(testUser));
            bcryptMock.expects("compareSync").withExactArgs("wrongpassword", "password")
                .returns(false);
            return authenticator.changePassword("a.b.c", "wrongpassword", "newpassword")
                .then(() => {
                    jwtMock.verify();
                    userRepoMock.verify();
                    bcryptMock.verify();
                    return chai.assert.fail();
                }).catch((err) => {
                    jwtMock.verify();
                    userRepoMock.verify();
                    bcryptMock.verify();
                    return err.message.should.eql("invalid password for username");
                });
        });
    });

    describe("verifyUser", () => {
        it("should return a token if the provided password matches the user's password", () => {
            userRepoMock.expects("get").withExactArgs("username")
                .returns(Promise.resolve(testUser));
            bcryptMock.expects("compareSync").withExactArgs("password", "password")
                .returns(true);
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
            bcryptMock.expects("compareSync").withExactArgs("wrongpassword", "password")
                .returns(false);
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
