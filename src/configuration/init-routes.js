"use strict";

let PostsRoutes = require("../routes/posts-routes/posts-routes");
let S3Routes = require("../routes/s3-routes/s3-routes");
let AuthRoutes = require("../routes/auth-routes/auth-routes");

module.exports = function (router) {
    new PostsRoutes(router);
    new S3Routes("stepinto-io-static-resources", router);
    new AuthRoutes(router);
};
