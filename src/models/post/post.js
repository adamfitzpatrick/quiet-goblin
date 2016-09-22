"use strict";

let uuid = require("uuid");

function Post(postObject) {
    this.id = uuid.v4();
    this.date = postObject.date || new Date();
    this.title = postObject.title;
    this.description = postObject.description;
    this.featured = !!postObject.featured;
    this.cover = postObject.cover;
    this.height = postObject.height;
    this.tags = postObject.tags || [];
}
Post.prototype.addTag = function (tag) { this.tags.push(tag); };

module.exports = Post;