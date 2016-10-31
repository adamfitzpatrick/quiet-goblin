"use strict";

let LOGGER = require("../../configuration/logging/logger");
let SecureRoutes = require("../../iam/secure-router/secure-router");
let childProcess = require('child_process');
let permissions = require("../../iam/permissions/permissions");

class AdminRoutes {

    constructor(application) {
        this.router = new SecureRoutes(application, "/admin");
        this.makeRoutes();
        this.LOGGER = LOGGER({ source: "AdminRoutes" });
    }

    deployUIApp(request, response) {
        let tag = request.params.tag;
        let deploy = childProcess.spawn("sh", ["./utility/ui/deploy-ui.sh", tag], { cwd: "." });
        this.LOGGER.info("Starting UI deploy process", { tag: tag });
        deploy.stdout.on("data", (data) => response.write(data));
        deploy.on("close", (code) => {
            let log = "info";
            let status = 200;
            if (code !== 0) {
                log = "error";
                status = 500;
            }
            this.LOGGER[log]("UI deploy process exited", { tag: tag, code: code });
            response.status(status).end();
        });
    }

    makeRoutes() {
        this.router.get("/deploy-ui/:tag", this.deployUIApp.bind(this),
            { permissions: permissions.deploy_ui });
    }
}

module.exports = AdminRoutes;
