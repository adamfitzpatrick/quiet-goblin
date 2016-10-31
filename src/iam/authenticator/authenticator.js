"use strict";

let fs = require("fs");
let path = require("path");
let bluebird = require("bluebird");
let jwt = bluebird.promisifyAll(require("jsonwebtoken"));
let bcrypt = bluebird.promisifyAll(require("bcrypt"));

let secretPath = require("../../configuration/app-config").secret;
let secret = "foo"; //fs.readFileSync(secretPath);

let DynamoDBRepository = require("../../common/dynamodb-repo/dynamodb-repo");
let tableName = require("../../configuration/app-config").dynamo_tables.user;
let LOGGER = require("../../configuration/logging/logger");
let permissions = require("../permissions/permissions");

class Authenticator {

    constructor() {
        this.userRepository = new DynamoDBRepository(tableName);
        this.LOGGER = LOGGER({ source: "Authenticator" });
        this.activeTokens = [];
    }

    generateHash(password) {
        return bcrypt.hashAsync(password, 12);
    }

    checkPassword(user, password) {
        return bcrypt.compareAsync(password, user.password).then((verified) => {
            if (verified) {
                this.LOGGER.info("secure token issued", { username: user.username });
                let token = jwt.sign(user, secret, { expiresIn: 600000 });
                this.activeTokens.push(token);
                return token;
            } else {
                let err = `invalid password for ${user.username}`;
                this.LOGGER.error(err, { username: user.username });
                throw new Error(err);
            }
        });
    }

    addUser(user) {
        user.permissions = permissions.level(1);
        return this.generateHash(user.password).then(hashedPassword => {
            user.password = hashedPassword;
            return this.userRepository.putUnique(user).catch(err => {
                if (err.message === "object must be unique by id") {
                    err = "username already exists";
                    this.LOGGER.error(err, { username: user.username });
                }
                throw new Error(err);
            });
        });
    }

    verifyUser(username, password) {
        return this.userRepository.get(username).then((user) => {
            return this.checkPassword(user, password);
        }, err => {
            this.LOGGER.error(err, { username: username });
            throw new Error(err);
        });
    }

    deverifyUser(token) {
        let index = this.activeTokens.indexOf(token);
        if (index > -1) {
            this.activeTokens.splice(index, 1);
            let tokenPayload = jwt.decode(token);
            this.LOGGER.info("user logged out", { username: tokenPayload.username });
            return tokenPayload;
        }
        this.LOGGER.warn("invalid token", { token: token });
    }
}

module.exports = Authenticator;
