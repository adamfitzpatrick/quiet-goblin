"use strict";

let mongoose = require("mongoose");

let PostSchema = new mongoose.Schema({
    id: String,
    date: Date,
    featured: Boolean,
    tags: [String],
    title: String,
    description: String,
    cover: String,
    height: { type: Number, default: 0 }
});

mongoose.model("Post", PostSchema);
