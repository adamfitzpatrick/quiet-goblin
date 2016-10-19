"use strict";

let PostsRoutes = require("../routes/posts-routes/posts-routes");
let S3Routes = require("../routes/s3-routes/s3-routes");
let AuthRoutes = require("../iam/auth-routes/auth-routes");

module.exports = function (application) {
    new PostsRoutes(application);
    new S3Routes("stepinto-io-static-resources", application);
    new AuthRoutes(application);
};
