"use strict";

let Repository = require("../repository");

class PostsRepository extends Repository {

    constructor() {
        super();
        this.table = "ragingGoblinPosts";
    }
}

module.exports = PostsRepository;