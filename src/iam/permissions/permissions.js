"use strict";

let permissions = {
    add_user: "add_user",
    delete_comment: "delete_comment",
    delete_post: "delete_post",
    read_comment: "read_comment",
    read_post: "read_post",
    "read_stepinto-io-static-resources": "read_stepinto-io-static-resources",
    user_admin: "user_admin",
    user_self: "user_self",
    write_comment: "write_comment",
    write_post: "write_post",
    "write_stepinto-io-static-resources": "write_stepinto-io-static-resources"
};

let PERMISSION_LEVELS = [];
PERMISSION_LEVELS.push([
    permissions.add_user,
    permissions.read_comment,
    permissions.read_post
]);
PERMISSION_LEVELS.push(PERMISSION_LEVELS[0].concat([
    permissions.user_self,
    permissions.write_comment
]));
PERMISSION_LEVELS.push(Object.keys(permissions).map(key => permissions[key]));

permissions.level = (level) => PERMISSION_LEVELS[level];

module.exports = permissions;
