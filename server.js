
    // set up ======================================================================
    var express  = require('express');
    var session = require('express-session')
    var cookieParser = require('cookie-parser')
    var app      = express();                               // create our app w/ express
    var mongoose = require('mongoose');                     // mongoose for mongodb
    var port     = process.env.PORT || 3000;                // set the port
    var database = require('./config/database');            // load the database config
    var morgan = require('morgan');             // log requests to the console (express4)
    var bodyParser = require('body-parser');    // pull information from HTML POST (express4)
    var methodOverride = require('method-override'); // simulate DELETE and PUT (express4)
    var passport = require('passport');
    var GitHubStrategy = require('passport-github').Strategy;
    var config = require("./config/config.json");

    // configuration ===============================================================
    mongoose.connect(database.url);     // connect to mongoDB database

    app.use(express.static(__dirname + '/public'));                 // set the static files location /public/img will be /img for users
    app.use(morgan('dev'));                                         // log every request to the console
    app.use(bodyParser.urlencoded({'extended':'true'}));            // parse application/x-www-form-urlencoded
    app.use(bodyParser.json());                                     // parse application/json
    app.use(bodyParser.json({ type: 'application/vnd.api+json' })); // parse application/vnd.api+json as json
    app.use(methodOverride());
    app.use(cookieParser());
    app.use(session({ secret: 'mylittledirtysecret' }));
    app.use(passport.initialize());
    app.use(passport.session());

    // routes ======================================================================
    require('./app/routes.js')(app);
    var User = require('./app/models/user');

    passport.use(new GitHubStrategy({
        clientID: config.github_id,
        clientSecret: config.github_secret,
        callbackURL: config.callbackurl
    },
    function (accessToken, refreshToken, profile, done) {
        process.nextTick(function () {
            console.log(profile.username);
            if ((profile.username!='julienbiau')&&(profile.username!='s4db0y')&&(profile.username!='MagicMicky')) {
              return done("error");
            }
            User.findOne({ 'githubID' : profile.id }, function (err, user) {
                 // if there is an error, stop everything and return that
                // ie an error connecting to the database
                if (err)
                    return done(err);

                // if the user is found then log them in
                if (user) {
                    User.update({id : user.id}, {
                        githubID : profile.id,
                        githubToken : accessToken,
                        username : profile.username,
                        displayName : profile.displayName,
                        avatarUrl : profile._json.avatar_url
                    }, function(err, numberAffected, rawResponse) {
                    });
                    return done(null, user); // user found, return that user
                } else {
                    // if there is no user, create them
                    var newUser = new User();

                    // set all of the user data that we need
                    newUser.githubID = profile.id;
                    newUser.githubToken = accessToken;
                    newUser.username = profile.username;
                    newUser.displayName = profile.displayName;
                    newUser.avatarUrl = profile._json.avatar_url;
                    newUser.sla = '1';
                    newUser.projects = [];

                    // save our user into the database
                    newUser.save(function(err) {
                        if (err)
                            throw err;
                        return done(null, newUser);
                    });
                }
            });
        });
    }));

    passport.serializeUser(function(user, done) {
        done(null, user.id);
    });

    passport.deserializeUser(function(id, done) {
        User.findById(id, function(err, user) {
            done(err, user)
        });
    });

    // listen (start app with node server.js) ======================================
    app.listen(port);
    console.log("App listening on port " + port);
