"use strict";

let PostsRepository = require("../../repository/posts-repository/posts-repository");
let Post = require("../../models/post/post");

let _this;

function PostRoutes(router) {
    _this = this;
    this.router = router;
    this.repository = new PostsRepository();
    this.makeRoutes();
}

PostRoutes.prototype.addPost = (request, response) => {
    let posts = new Post(request.body);
    return _this.repository.put(posts).then((data) => response.json(data));
};

PostRoutes.prototype.getPosts = (request, response) => {
    return _this.repository.scan().then((data) => response.json(data));
};

PostRoutes.prototype.makeRoutes = function () {
    this.router.get("/posts", this.getPosts);
    this.router.post("/posts", this.addPost);
};

module.exports = PostRoutes;