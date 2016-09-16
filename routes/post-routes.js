"use strict";

let mongoose = require("mongoose");
let Post = mongoose.model("Post");

module.exports = (router) => {
    router.get('/posts', (req, res, next) => {
        Post.find((err, posts) => {
            if (err) { return next(err); }
            res.json(posts);
        });
    });

    router.get('/posts/:postId', (req, res, next) => {
        Post.findById(req.params.postId, (err, post) => {
            if (err) { return next(err); }
            res.json(post);
        });
    });

    router.post('/posts', (req, res, next) => {
        var post = new Post(req.body);
        post.save((err, post) => {
            if (err) { return next(err); }
            res.json(post);
        });
    });

    router.post('/posts/:postId', (req, res, next) =>{
        let callback = (err) => {
            if (err) { return next(err); }
            res.json({ _id: req.params.postId })
        };
        Post.update({ _id: req.params.postId }, req.body, {}, callback);
    });
};
