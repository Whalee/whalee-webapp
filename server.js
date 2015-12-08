
    // set up ======================================================================
    var express  = require('express');
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var port     = process.env.PORT || 3000;                // set the port
    var database = require('./config/database');            // load the database config
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var passport = require('passport');
    var GitHubStrategy = require('passport-github').Strategy;


    var GITHUB_CLIENT_ID = "aacc720e3bfb3b602fb4";
    var GITHUB_CLIENT_SECRET = "adf5ece9f96e3a23c2b31404f0ee40c85b20c584";

    // configuration ===============================================================
    mongoose.connect(database.url);     // connect to mongoDB database

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.use(passport.initialize());
    app.use(passport.session());

    // routes ======================================================================
    require('./app/routes.js')(app);

    passport.use(new GitHubStrategy({
        clientID: GITHUB_CLIENT_ID,
        clientSecret: GITHUB_CLIENT_SECRET,
    callbackURL: "http://localhost:3000/auth/callback"
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
        console.log(profile);
            return done(null, profile);
        });
    }
    ));

    passport.serializeUser(function(user, done) {
        done(null, user);
    });

    passport.deserializeUser(function(obj, done) {
        done(null, obj);
    });

    // listen (start app with node server.js) ======================================
    app.listen(port);
    console.log("App listening on port " + port);