"use strict";
let maker = require("./make-tables");

let tablesReady = false;
maker().then(() => tablesReady = true);

let waitLimit = 10;
let currentWait = 1;
setInterval(() => {
    if (tablesReady) {
        console.log("Data tables created.");
        process.exit(0);
    } else {
        currentWait++;
        if (currentWait > waitLimit) {
            console.error("Timeout waiting for data tables.");
            process.exit(1);
        }
    }
}, 1000);