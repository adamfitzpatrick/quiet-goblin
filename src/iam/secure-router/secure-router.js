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

    get(routeString, handlers, options) {
        this.configureRoutingData("GET", routeString, handlers, options);
        this.router.get(routeString, handlers);
    }

    post(routeString, handlers, options) {
        this.configureRoutingData("POST", routeString, handlers, options);
        this.router.post(routeString, handlers);
    }

    delete(routeString, handlers, options) {
        this.configureRoutingData("DELETE", routeString, handlers, options);
        this.router.delete(routeString, handlers);
    }

    configureRoutingData(method, routeString, handlers, options) {
        parseOptions(options);
        this.routeDefinitions[`${method}_${this.replaceRouteStringParams(routeString)}`] = {
            routeString: routeString,
            handler: handlers,
            permissions: options.permissions,
            secure: options.secure
        };
    }

    replaceRouteStringParams(routeString) {
        let str = routeString.replace(/:[^/]+/, "[^/]+");
        str += "$";
        return str;
    }
}

module.exports = SecureRouter;
