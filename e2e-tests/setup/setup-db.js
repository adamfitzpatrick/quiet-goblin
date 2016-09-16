"use strict";

let async = require("async");

let makeDb = [(cb) => require("./manage-test-db").initialize().then(cb)];

async.parallel(makeDb, () => console.log("Database ready."));
