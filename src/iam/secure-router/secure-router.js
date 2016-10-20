"use strict";

let express = require("express");

let Gatekeeper = require("../gatekeeper/gatekeeper");

function parseOptions(options) {
    if (typeof options.permissions === "string") { options.permissions = [options.permissions]; }
    options.secure = options.secure !== false;
}

class SecureRouter {

    constructor(application, routeString) {
        this.routeDefinitions = {};
        this.router = express.Router();
        let gatekeeper = new Gatekeeper(this.routeDefinitions);
        this.router.use(gatekeeper.process.bind(gatekeeper));
        application.use(routeString, this.router);
    }

    get(routeString, handler, options) {
        this.configureRoutingData(routeString, handler, options);
        this.router.get(routeString, handler);
    }

    post(routeString, handler, options) {
        this.configureRoutingData(routeString, handler, options);
        this.router.post(routeString, handler);
    }

    configureRoutingData(routeString, handler, options) {
        parseOptions(options);
        this.routeDefinitions[routeString] = {
            routeString: routeString,
            handler: handler,
            permissions: options.permissions,
            secure: options.secure
        };
    }
}

module.exports = SecureRouter;
