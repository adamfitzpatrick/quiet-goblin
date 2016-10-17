"use strict";

let Authenticator = require("../../authenticator/authenticator");
let User = require("../../models/user/user");

let _this;

class AuthRoutes {

    constructor(router) {
        _this = this;
        this.router = router;
        this.authenticator = new Authenticator();
        this.addRoutes();
    }

    getToken(request, response) {
        return _this.authenticator.verifyUser(request.body.username, request.body.password)
            .then(token => {
                return response.json({ token: token });
            }).catch(err => {
                return response.status(401).json(err);
            });
    }

    addUser(request, response) {
        let user = new User(request.body);
        return _this.authenticator.addUser(user)
            .then(user => {
                return response.json(user);
            }).catch(err => {
                return response.status(400).json({ message: err.message });
            });
    }

    addRoutes() {
        this.router.post("/auth", this.getToken);
        this.router.post("/auth/add-user", this.addUser);
    }
}

module.exports = AuthRoutes;
