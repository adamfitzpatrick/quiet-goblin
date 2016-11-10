"use strict";

let driver = require("./admin.driver");

function Admin() {
    this.Before(() => {
        driver.users.push("fakeadmin");
        let permissions = ["user_admin"];
        return driver.createAccountWithoutApp("fakeadmin", "fakeadminpassword", permissions);
    });

    this.Given(/^I am logged in as an administrator$/, () => {
        return driver.login("fakeadmin", "fakeadminpassword");
    });

    this.Then(/^I change the password for '([^\s]+)' to '([^\s]+)'$/, (username, password) => {
        return driver.changePassword(username, password)
            .set("x-access-token", driver.supportData.token)
            .expect(200);
    });

    this.After(() => {
        return driver.cleanUserTable();
    });
}

module.exports = Admin;
