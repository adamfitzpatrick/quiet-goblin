"use strict";

let fs = require("fs");
let ncp = require("ncp");
let getAppConfig = require("./get-app-config");

module.exports = function dataConfig() {
    let staticDir = getAppConfig("static_source");
    fs.existsSync(staticDir) || fs.mkdirSync(staticDir);

    let imagesDir = `${process.cwd()}/static/images`;
    ncp(imagesDir, `${staticDir}/images`, (err) => {
        if (err) { console.error(err); }
    });
};