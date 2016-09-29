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
    let post = new Post(request.body);
    return _this.repository.put(post).then((data) => response.json(data));
};

PostRoutes.prototype.getPost = (request, response) => {
    return _this.repository.get(request.params.id).then((data) => response.json(data));
};

PostRoutes.prototype.getPosts = (request, response) => {
    return _this.repository.scan().then((data) => response.json(data));
};

PostRoutes.prototype.updatePost = (request, response) => {
    let id = request.params.id;
    return _this.repository.get(id).then((data) => {
        if (data.status) {
            return response.json(data);
        } else {
            let postToUpdate = new Post(data);
            postToUpdate.updateProperties(request.body);
            return _this.repository.put(postToUpdate).then((data) => response.json(data));
        }
    });

};

PostRoutes.prototype.makeRoutes = function () {
    this.router.get("/posts", this.getPosts);
    this.router.get("/posts/:id", this.getPost);
    this.router.post("/posts", this.addPost);
    this.router.post("/posts/:id", this.updatePost);
};

module.exports = PostRoutes;