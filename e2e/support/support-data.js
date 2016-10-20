"use strict";

let supportData = {
    users: [],
    posts: [],
    lastPost: () => supportData.posts[supportData.posts.length - 1],
    previousPost: () => supportData.posts[supportData.posts.length -2]
};

module.exports = supportData;
