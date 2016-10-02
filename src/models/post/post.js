"use strict";

let uuid = require("uuid");

class Post {
    constructor(postObject) {
        this.id = postObject.id || uuid.v4();
        this.date = postObject.date || new Date().toISOString();
        this.title = postObject.title;
        this.description = postObject.description;
        this.featured = !!postObject.featured;
        this.cover = postObject.cover;
        this.height = postObject.height;
        this.tags = postObject.tags || [];
    }

    addTag(tag) { this.tags.push(tag); }

    updateProperties(properties) {
        Object.getOwnPropertyNames(this).forEach(key => {
            if (properties[key]) { this[key] = properties[key]; }
        });
    }
}

module.exports = Post;