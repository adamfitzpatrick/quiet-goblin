"use strict";

let fs = require("fs");
let bluebird = require("bluebird");
let jwt = bluebird.promisifyAll(require("jsonwebtoken"));

let secret = fs.readFileSync(require("../../configuration/app-config").secret);
let LOGGER = require("../../configuration/logging/logger");

class Gatekeeper {

    constructor(routeDefinitions) {
        this.routeDefinitions = routeDefinitions;
        this.LOGGER = LOGGER({ source: "Gatekeeper" });
    }

    process(request, response, next) {
        let url = request.url;
        let token = request.headers["x-access-token"];
        if (url.length > 1 && url[url.length - 1] === "/") { url = url.slice(0, url.length -1); }
        let route = this.routeDefinitions[url];
        if (!route) {
            this.LOGGER.warn("no specified route", { baseUrl: request.baseUrl, url: url });
            return response.status(404).send(`cannot ${request.method} ${request.baseUrl}${url}`);
        } else if (!route.secure) {
            return next();
        } else if (!token) {
            this.LOGGER.warn("attempted access without token", { path: request.path });
            return response.status(403).json({ error: "missing access token" });
        } else {
            return this.processToken(request, response, next, token);
        }
    }

    processToken(request, response, next, token) {
        return jwt.verifyAsync(token, secret).then(tokenPayload => {
            if (this.checkPermission(request, tokenPayload)) { return next(); }
            let logPayload = {
                path: request.path,
                username: tokenPayload.username,
                permissions: tokenPayload.permissions,
                requiredPermissions: this.routeDefinitions[request.url].permissions
            };
            this.LOGGER.warn("attempted access without permission", logPayload);
            return response.status(403).json({ error: "missing required permission" });
        }).catch(err => {
            this.LOGGER.warn("attempted access with invalid token",
                { path: request.path, error: JSON.stringify(err) });
            return response.status(403).json({ error: err.message });
        });
    }

    checkPermission(request, tokenPayload) {
        let requiredPermissions = this.routeDefinitions[request.url].permissions;
        return tokenPayload.permissions.some(permission => {
            return requiredPermissions.indexOf(permission) > -1;
        });
    }
}

module.exports = Gatekeeper;
