"use strict";

let Repository = require("../repository");

class PostsRepository extends Repository {

    constructor() {
        super();
        this.table = "ragingGoblin_posts";
    }
}

module.exports = PostsRepository;