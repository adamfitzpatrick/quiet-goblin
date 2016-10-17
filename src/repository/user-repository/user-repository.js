"use strict";

let Repository = require("../repository");
let TABLE_NAME = require("../../configuration/app-config").dynamo_tables.user;

class UserRepository extends Repository {

    constructor() {
        super(TABLE_NAME);
    }
}

module.exports = UserRepository;
