"use strict";

class User {
    /**
     * id: string (equal to username)
     * username: string (equal to id)
     * permissions: string[]
     * password: string
     */
    constructor(user) {
        Object.assign(this, user);
        this.id = user.username;
        if (!this.permissions) { this.permissions = []; }
    }

    checkPermission(permission) { return this.permissions.indexOf(permission) >= 0; }

    addPermission(permission) { this.permissions.push(permission); }

    removePermission(permission) {
        let index = this.permissions.indexOf(permission);
        if (index >= 0) {
            this.permissions.splice(index, 1);
        }
    }
}

module.exports = User;
