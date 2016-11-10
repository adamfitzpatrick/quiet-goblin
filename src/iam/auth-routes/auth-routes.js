"use strict";

let Authenticator = require("../authenticator/authenticator");
let User = require("../user/user");
let httpStatusMatcher = require("../../common/http-status-matcher/http-status-matcher");
let SecureRouter = require("../secure-router/secure-router");
let permissions = require("../permissions/permissions");

let _this;

class AuthRoutes {

    constructor(application) {
        _this = this;
        this.router = new SecureRouter(application, "/auth");
        this.authenticator = new Authenticator();
        this.addRoutes();
    }

    getToken(request, response) {
        return this.authenticator.verifyUser(request.body.username, request.body.password)
            .then(token => {
                return response.json({ token: token });
            }, err => {
                err = err.message || err;
                return response.status(httpStatusMatcher(err)).json(err);
            });
    }

    addUser(request, response) {
        let user = new User(request.body);
        return this.authenticator.addUser(user)
            .then(user => {
                return this.authenticator.verifyUser(user.username, request.body.password)
                    .then(token => {
                        return response.json({ token: token });
                    });
            }).catch(err => {
                return response.status(httpStatusMatcher(err)).json(err);
            });
    }

    changePassword(request, response) {
        let token = request.headers["x-access-token"];
        let body = request.body;
        if (!body || !body.oldPassword || !body.newPassword) {
            return response.status(400).json("missing password parameter(s)");
        }
        return this.authenticator.changePassword(token, body.oldPassword, body.newPassword)
            .then(() => {
                let result = { username: body.username, result: "password changed" };
                return response.status(200).json(result);
            })
            .catch((err) => {
                return response.status(httpStatusMatcher(err)).json(err);
            });
    }

    logout(request, response) {
        let tokenPayload = this.authenticator.deverifyUser(request.headers["x-access-token"]);
        if (tokenPayload) {
            return response.status(200).json({ username: tokenPayload.username });
        }
        return response.status(400).json("invalid token");
    }

    addRoutes() {
        this.router.post("/", this.getToken.bind(this), { secure: false });
        this.router.post("/add-user", this.addUser.bind(this), { secure: false });
        this.router.post("/change-password", this.changePassword.bind(this),
            { permissions: permissions.user_self });
        this.router.post("/logout", this.logout.bind(this), { permissions: permissions.user_self });
    }
}

module.exports = AuthRoutes;
