"use strict";

let uuid = require("uuid");

function Post(postObject) {
    this.id = postObject.id || uuid.v4();
    this.date = postObject.date || new Date().toISOString();
    this.title = postObject.title;
    this.description = postObject.description;
    this.featured = !!postObject.featured;
    this.cover = postObject.cover;
    this.height = postObject.height;
    this.tags = postObject.tags || [];
}

Post.prototype.addTag = function (tag) { this.tags.push(tag); };

Post.prototype.updateProperties = function (properties) {
    let _this = this;
    Object.getOwnPropertyNames(_this).forEach(function (key) {
        if (properties[key]) {
            _this[key] = properties[key];
        }
    });
};

module.exports = Post;