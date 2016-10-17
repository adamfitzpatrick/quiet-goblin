"use strict";

let secret = require("../configuration/app-config").secret;
let UserRepository = require("../repository/user-repository/user-repository");
let bluebird = require("bluebird");
let jwt = bluebird.promisifyAll(require("jsonwebtoken"));
let bcrypt = bluebird.promisifyAll(require("bcrypt"));
let LOGGER = require("../configuration/logging/logger");

class Authenticator {

    constructor() {
        this.userRepository = new UserRepository();
        this.LOGGER = LOGGER({ source: "Authenticator" });
    }

    generateHash(password) {
        return bcrypt.hashAsync(password, 12);
    }

    checkPassword(user, password) {
        return bcrypt.compareAsync(password, user.password).then((verified) => {
            if (verified) {
                this.LOGGER.info("Secure token issued", { username: user.username });
                return jwt.sign(user, secret, { expiresIn: 600000 });
            } else {
                throw `Invalid password for ${user.username}`;
            }
        });
    }

    addUser(user) {
        return this.generateHash(user.password).then(hashedPassword => {
            user.password = hashedPassword;
            return this.userRepository.putUnique(user).catch(() => {
                this.LOGGER.error("User already exists", { username: user.username });
                throw new Error("User already exists");
            });
        });
    }

    verifyUser(username, password) {
        return this.userRepository.get(username).then((user) => {
            return this.checkPassword(user, password);
        }).catch((err) => {
            this.LOGGER.error(err, { username: username });
            throw err;
        });
    }
}

module.exports = Authenticator;
