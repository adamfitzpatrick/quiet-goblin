"use strict";

let bcrypt = require("bcrypt");

let SecureRouter = require("../../iam/secure-router/secure-router");
let DynamoDBRepository = require("../../common/dynamodb-repo/dynamodb-repo");
let tableName = require("../../configuration/app-config").dynamo_tables.user;
let httpStatusMatcher = require("../../common/http-status-matcher/http-status-matcher");
let permissions = require("../../iam/permissions/permissions");

class AdminRoutes {

    constructor(application) {
        this.router = new SecureRouter(application, "/admin");
        this.userRepo = new DynamoDBRepository(tableName);
        this.addRoutes();
    }

    changePassword(request, response) {
        let body = request.body;
        if (!body.username || !body.password) {
            return response.status(400).json("missing username or new password");
        }
        return this.userRepo.get(body.username).then(user => {
            user.password = bcrypt.hashSync(body.password, 12);
            return this.userRepo.put(user).then(user => {
                return response.status(200)
                    .json({ username: user.username, message: "password updated" });
            });
        }, err => {
            return response.status(httpStatusMatcher(err.message));
        });
    }

    addRoutes() {
        this.router.post("/change-password", this.changePassword.bind(this),
            { permissions: permissions.user_admin });
    }
}

module.exports = AdminRoutes;
