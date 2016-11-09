"use strict";

let fs = require("fs");
let bluebird = require("bluebird");
let jwt = bluebird.promisifyAll(require("jsonwebtoken"));
let bcrypt = bluebird.promisifyAll(require("bcrypt"));

let secret = fs.readFileSync(require("../../configuration/app-config").secret);

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

    authenticate(username, password) {
        return this.userRepository.get(username).then(user => {
            if (bcrypt.compareSync(password, user.password)) {
                return user;
            } else {
                let err = `invalid password for ${username}`;
                this.LOGGER.error(err, { username: username });
                throw new Error(err);
            }
        }, err => {
            this.LOGGER.error(err, { username: username });
            throw new Error(err);
        });
    }

    generateHash(password) {
        return bcrypt.hashSync(password, 12);
    }

    issueToken(user) {
        this.LOGGER.info("secure token issued", { username: user.username });
        let token = jwt.sign(user, secret, { expiresIn: 600000 });
        this.activeTokens.push(token);
        return token;
    }

    addUser(user) {
        user.permissions = permissions.level(1);
        user.password = this.generateHash(user.password);
        return this.userRepository.putUnique(user).catch(err => {
            if (err.message === "object must be unique by id") {
                err = "username already exists";
                this.LOGGER.error(err, { username: user.username });
            }
            throw new Error(err);
        });
    }

    changePassword(token, oldPassword, newPassword) {
        let payload = jwt.decode(token);
        if (!payload || !payload.username) { throw new Error("invalid access token"); }
        return this.authenticate(payload.username, oldPassword).then(user => {
            user.password = this.generateHash(newPassword);
            return this.userRepository.put(user);
        }).catch(err => {
            throw new Error(err.message);
        });
    }

    verifyUser(username, password) {
        return this.authenticate(username, password).then(user => {
            return this.issueToken(user);
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
