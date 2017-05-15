"use strict";

module.exports = (req, res) => {
    const direct = req.path.substr(1, req.path.length);
    res.redirect(`/?direct=${direct}`);
};