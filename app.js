"use strict";

if (process.env.EB_INSTANCE_ENV_TAG) {
    process.env.NODE_ENV = process.env.EB_INSTANCE_ENV_TAG;
}

require("./src/server.js")();
