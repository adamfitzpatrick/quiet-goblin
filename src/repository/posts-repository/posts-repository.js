"use strict";

let Repository = require("../repository");

function PostsRepository() {
    Repository.call(this);
}

PostsRepository.table = "ragingGoblinPosts";
Repository.extendTo(PostsRepository);

module.exports = PostsRepository;