"use strict";

let express = require("express");

let Authenticator = require("../authenticator/authenticator");
let User = require("../user/user");
let httpStatusMatcher = require("../../common/http-status-matcher/http-status-matcher");
let SecureRouter = require("../secure-router/secure-router");

let _this;

class AuthRoutes {

    constructor(application) {
        _this = this;
        this.application = application;
        this.router = express.Router();
        this.router = new SecureRouter(application, "/auth");
        this.authenticator = new Authenticator();
        this.addRoutes();
    }

    getToken(request, response) {
        return _this.authenticator.verifyUser(request.body.username, request.body.password)
            .then(token => {
                return response.json({ token: token });
            }, err => {
                return response.status(httpStatusMatcher(err)).json(err);
            });
    }

    addUser(request, response) {
        let user = new User(request.body);
        return _this.authenticator.addUser(user)
            .then(user => {
                return _this.authenticator.verifyUser(user.username, request.body.password)
                    .then(token => {
                        return response.json({ token: token });
                    });
            }).catch(err => {
                return response.status(httpStatusMatcher(err)).json(err);
            });
    }

    logout(request, response) {
        let tokenPayload = _this.authenticator.deverifyUser(request.headers["x-access-token"]);
        if (tokenPayload) {
            return response.status(200).json({ username: tokenPayload.username });
        }
        return response.status(400).json("invalid token");
    }

    addRoutes() {
        this.router.post("/", this.getToken, { secure: false });
        this.router.post("/add-user", this.addUser, { secure: false });
        this.router.post("/logout", this.logout, { permissions: ["baseline_access"] });
    }
}

module.exports = AuthRoutes;
