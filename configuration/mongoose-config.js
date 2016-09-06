"use strict";

let mongoose = require("mongoose");
let getParams = require("./get-app-config");

module.exports = function mongooseConfig() {
    require("../models/posts.js");
    mongoose.connect(`mongodb://${getParams("mongo_address")}`);
};