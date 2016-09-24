"use strict";

let Repository = require("../repository");

function PostsRepository() {
    Repository.call(this);
    this.table = "ragingGoblinPosts";
}

Repository.extendTo(PostsRepository);

module.exports = PostsRepository;