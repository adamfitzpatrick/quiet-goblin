"use strict";

process.argv.push("--env");
process.argv.push("e2e");

let inquirer = require("inquirer");

function ListMenu(id, message, tasks) {
    this.id = id;
    this.tasks = tasks;
    this.menu = {
        type: "list",
        name: id,
        message: message,
        choices: tasks.map(task => task.name)
    };
}
ListMenu.prototype.getTask = function (taskName) {
    return this.tasks.find(task => task.name === taskName).task;
};
ListMenu.prototype.show = function () {
    let _this = this;
    inquirer.prompt(this.menu).then(function (selection) {
        _this.getTask(selection[_this.id])();
    });
};

let applicationContent = {};

let mainMenuTasks = [{
    name: "Database management",
    task: databaseManagement
}, {
    name: "Quit",
    task: quitApplication
}];
applicationContent.mainMenu = new ListMenu("main", "Select a task set:", mainMenuTasks);

let databaseManagementTasks = [{
    name: "Backup database",
    task: backupDatabase
}, {
    name: "Restore database",
    task: restoreDatabase
}, {
    name: "Wipe database",
    task: wipeDatabase
}, {
    name: "Write fake data to database",
    task: fakeDatabase
}, {
    name: "Back to main menu",
    task: mainMenu
}];
applicationContent.databaseManagement = new ListMenu("mgdb", "Select a database operation:",
    databaseManagementTasks);

function mainMenu() {
    applicationContent.mainMenu.show();
}

function confirmAction(message) {
    return inquirer.prompt({
        type: "input",
        name: "confirm",
        message: message
    }).then(function (response) {
        return response.confirm === "y";
    });
}

function databaseManagement() {
    applicationContent.databaseManagement.show();
}

function backupDatabase() {
    require("./db-utilities/backup-local-db")().then(databaseManagement);
}

function restoreDatabase() {
    confirmAction("This will erase the entire database. Continue? (y/N) ")
        .then((go) => {
            if (go) {
                require("./db-utilities/restore-local-db")().then(databaseManagement);
            } else {
                databaseManagement();
            }
        });
}

function wipeDatabase() {
    confirmAction("This will erase the entire database. Continue? (y/N) ")
        .then((go) => {
            if (go) {
                require("./db-utilities/make-tables")().then(databaseManagement);
            } else {
                databaseManagement();
            }
        });
}

function fakeDatabase() {
    confirmAction("This will erase the entire database. Continue? (y/N) ")
        .then((go) => {
            if (go) {
                require("./db-utilities/restore-local-db")(true).then(databaseManagement);
            } else {
                databaseManagement();
            }
        });
}

function quitApplication() { process.exit(0); }

mainMenu();