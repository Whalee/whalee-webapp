// app/models/user.js

    // load mongoose since we need it to define a model
    var mongoose = require('mongoose');

    module.exports = mongoose.model('User', {
        id : String/*,
        token : String,
        sla : String,
        projects : [String]*/
    });