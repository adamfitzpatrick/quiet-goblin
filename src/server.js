"use strict";

let express = require("express");
let bodyParser = require("body-parser");
let appConfig = require("./configuration/app-config");

let AuthRoutes = require("./iam/auth-routes/auth-routes");
let PostsRoutes = require("./posts/posts-routes/posts-routes");
let CommentRoutes = require("./comment/comment-routes/comment-routes");
let S3Routes = require("./s3/s3-routes/s3-routes");

module.exports = function () {
    require("./configuration/aws-config");
    let LOGGER = require("./configuration/logging/logger")();

    LOGGER.info("Starting application...");

    let app = express();
    app.use(bodyParser.json());
    app.use(express.static(appConfig.static_source));

    new AuthRoutes(app);
    new PostsRoutes(app);
    new CommentRoutes(app);
    new S3Routes("stepinto-io-static-resources", app);

    let port = appConfig.port || process.env.PORT;
    app.listen(port);

    LOGGER.info(`Goblins listening on ${port}`);
};
