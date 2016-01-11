// app/models/project.js

    // load mongoose since we need it to define a model
    var mongoose = require('mongoose');

    module.exports = mongoose.model('Project', {
        githubID : String,
        name 	  : String,
        owner     : String,
        cloneUrl : String,
        deployed : String,
        hooked : String,
        webhookID : String,
        coreID : String
    });