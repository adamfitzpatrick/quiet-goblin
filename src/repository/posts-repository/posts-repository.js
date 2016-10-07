"use strict";

let Repository = require("../repository");
let TABLE_NAME = require("../../configuration/app-config").dynamo_tables.posts;

class PostsRepository extends Repository {

    constructor() {
        super();
        this.table = TABLE_NAME;
    }
}

module.exports = PostsRepository;