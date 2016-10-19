"use strict";

let secret = require("../../configuration/app-config").secret;
let DynamoDBRepository = require("../../common/dynamodb-repo/dynamodb-repo");
let tableName = require("../../configuration/app-config").dynamo_tables.user;
let bluebird = require("bluebird");
let jwt = bluebird.promisifyAll(require("jsonwebtoken"));
let bcrypt = bluebird.promisifyAll(require("bcrypt"));
let LOGGER = require("../../configuration/logging/logger");

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
        if (index > -1) { this.activeTokens.splice(index, 1); }
    }
}

module.exports = Authenticator;
