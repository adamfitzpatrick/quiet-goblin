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
        let token = request.headers["x-access-token"];
        let route = this.determineRoute(request);
        if (!route) {
            this.LOGGER.warn("no specified route", { baseUrl: request.baseUrl, url: request.url });
            return response.status(404)
                .send(`cannot ${request.method} ${request.baseUrl}${request.url}`);
        } else if (!route.secure) {
            return next();
        } else if (!token) {
            this.LOGGER.warn("attempted access without token",
                { path: `${request.baseUrl}${request.path}` });
            return response.status(403).json({ error: "missing access token" });
        } else {
            return this.processToken(request, response, next, token);
        }
    }

    processToken(request, response, next, token) {
        let permissions = this.determineRoute(request).permissions;
        return jwt.verifyAsync(token, secret).then(tokenPayload => {
            if (this.checkPermission(permissions, tokenPayload)) { return next(); }
            let logPayload = {
                path: request.path,
                username: tokenPayload.username,
                permissions: tokenPayload.permissions,
                requiredPermissions: permissions
            };
            this.LOGGER.warn("attempted access without permission", logPayload);
            return response.status(403).json({ error: "missing required permission" });
        }).catch(err => {
            this.LOGGER.warn("attempted access with invalid token",
                { path: request.path, error: JSON.stringify(err) });
            return response.status(403).json({ error: err.message });
        });
    }

    checkPermission(requiredPermissions, tokenPayload) {
        return tokenPayload.permissions.some(permission => {
            return requiredPermissions.indexOf(permission) > -1;
        });
    }

    determineRoute(request) {
        let path = request.path;
        if (path.length > 1 && path[path.length - 1] === "/") {
            path = path.slice(0, path.length -1);
        }
        return Object.keys(this.routeDefinitions).reduce((routeDef, route) => {
            let regexp = new RegExp(route);
            if (regexp.test(`${request.method}_${path}`)) {
                routeDef = this.routeDefinitions[route];
            }
            return routeDef;
        }, void 0);
    }
}

module.exports = Gatekeeper;
