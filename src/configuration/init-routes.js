"use strict";

let PostsRoutes = require("../routes/posts-routes/posts-routes");

module.exports = function (router) {
    new PostsRoutes(router);
};