// app/models/user.js

    // load mongoose since we need it to define a model
    var mongoose = require('mongoose');

    module.exports = mongoose.model('User', {
        githubID : String,
        token : String,
        username : String,
        displayName : String,
        avatarUrl : String,
        sla : String,
        projects : [String]
    });