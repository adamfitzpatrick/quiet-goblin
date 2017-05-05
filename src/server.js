"use strict";

let express = require("express");
let helmet = require("helmet");
let bodyParser = require("body-parser");

let appConfig = require("./configuration/app-config");
let CORSFilter = require("./configuration/cors-filter/cors-filter");

let AdminRoutes = require("./admin/admin-routes/admin-routes");
let AuthRoutes = require("./iam/auth-routes/auth-routes");
let PostsRoutes = require("./posts/posts-routes/posts-routes");
let CommentRoutes = require("./comment/comment-routes/comment-routes");
let S3Routes = require("./s3/s3-routes/s3-routes");

const path = require("path");
const rootDir = path.resolve(__dirname, "..");
const deployOpts = {
    cwd: path.resolve(__dirname, ".."),
    env: {
        "RAGING_GOBLIN_TAG": process.env.RAGING_GOBLIN_TAG,
        "PUBLIC_DIR": path.resolve("./public"),
        "ROOT": rootDir
    },
    stdio:[0,1,2]
};
require("child_process").execFileSync("./ui-deploy.sh", deployOpts);

module.exports = function () {
    require("./configuration/aws-config");
    let LOGGER = require("./configuration/logging/logger")();

    LOGGER.info("Starting application...");

    let app = express();
    app.use(helmet());
    app.use(bodyParser.json());
    app.use(express.static(appConfig.static_source));
    app.use(CORSFilter());

    new AdminRoutes(app);
    new AuthRoutes(app);
    new PostsRoutes(app);
    new CommentRoutes(app);
    new S3Routes("stepinto-io-static-resources", app);

    app.get("*", (req, res) => {
        const direct = req.path.substr(1, req.path.length);
        res.redirect(`/?direct=${direct}`);
    });

    let port = appConfig.port || process.env.PORT;
    app.listen(port);

    LOGGER.info(`Goblins listening on ${port}`);
};
