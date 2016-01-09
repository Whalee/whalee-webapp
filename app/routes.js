
var passport = require('passport');
var User = require('./models/user');
var Project = require('./models/project');
var https = require('https');


// expose the routes to our app with module.exports
module.exports = function(app) {

    // views -------------------------------------------------------------------------

    // home
    app.get('/home', function(req, res) {
        if(req.user)
            res.sendfile('./views/home.html');
        else
            res.redirect('/');
    });

    // error
    app.get('/error', function(req, res) {
        res.send('Error');
    });

    // index
    app.get('/', function(req, res) {
        res.sendfile('./views/index.html');
    });

    app.get('/auth', passport.authenticate('github'));

    app.get('/auth/callback', 
        passport.authenticate('github', {successRedirect: '/home',
                        failureRedirect:'/error'}));

    // local api ----------------------------------------------------------------------

    app.get('/api/user', function(req, res) {
        if(req.user)
            res.json(req.user); // return user in JSON format
        else
            res.redirect('/');     
    });

    // github api ---------------------------------------------------------------------

    app.get('/api/projects', function(req, res) {
        if(req.user) {
            // return user in JSON format
            console.log("DANS API : " + req.user.githubToken);
            var options = {
                host : 'api.github.com', // here only the domain name
                // (no http/https !)
                port : 443,
                path : '/user/repos', // the rest of the url with parameters if needed
                headers: {
                    "authorization" : "Bearer " +req.user.githubToken, 
                    "user-agent" : "Whalee-webapp" // GitHub is happy with a unique user agent 
                },
                method : 'GET' // do GET
            };

            https.request(options, function(res2) {
                console.log('STATUS: ' + res2.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res2.headers));
                res2.setEncoding('utf8');
                str = "";
                res2.on('data', function (chunk) {
                    str += chunk;
                });

                res2.on('end', function () {
                    console.log(str);
                    res.json(JSON.parse(str));
                });

            }).on('error', function(e) {console.log("Got error: " + e.message);}).end();      

        } else {
            res.redirect('/');  
        }
    });

    // mika api -----------------------------------------------------------------------

    app.post('/api/project', function(req, res) {
        if(req.user) {
            // return user in JSON format
            var options = {
                host : 'api.mika', // here only the domain name  @@@@@ TO DO @@@@@
                // (no http/https !)
                port : 443,
                path : '/project', // the rest of the url with parameters if needed
                headers: {
                    "Content-Type": "application/json",
                    "Content-Length": Buffer.byteLength(req.body)
                },
                method : 'POST' // do POST
            }
        };

            https.request(options, function(res2) {
                console.log('STATUS: ' + res2.statusCode);
                console.log('HEADERS: ' + JSON.stringify(res2.headers));
                res2.setEncoding('utf8');
                str = "";
                res2.on('data', function (chunk) {
                    str += chunk;
                });

                res2.on('end', function () {
                    console.log(str);
                    res.json(JSON.parse(str));
                });

            }).on('error', function(e) {console.log("Got error: " + e.message);}).end();      

        } else {
            res.redirect('/');  
        }
    });


    /*app.get('/api/projects' function(req, res) {
        if(req.user) {

        } else {
            res.redirect('/');
        }
    }); */

    // get all users
    /*app.get('/api/users', function(req, res) {

        // use mongoose to get all users in the database
        User.find(function(err, users) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.json(users); // return all users in JSON format
        });
    });

    app.get('/api/lolcat', function(req, res) {
        console.log("REQ.USER : \n" + req.user);
        res.json(req.user); // return user in JSON format     
    });

    // get an user
    app.get('/api/users/:user_id', function(req, res) {
        User.find({
            githubID : req.params.user_id
        }, function(err, user) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err) {
                res.send(err);
                console.log(err);
            }


            res.json(user); // return user in JSON format
        });
    });

    // create user and send back all users after creation
    app.post('/api/users', function(req, res) {

        // create a user, information comes from AJAX request from Angular
        User.create({
            id : req.body.text,
            token : 'token',
            sla: '1',
            projects : [] 
        }, function(err, user) {
            if (err) {
                res.send(err);
                console.log(err);
            }

            // get and return all the users after you create another
            User.find(function(err, users) {
                if (err)
                    res.send(err)
                res.json(users);
            });
        });

    });

    // delete a user
    app.delete('/api/users/:user_id', function(req, res) {
        User.remove({
            id : req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            User.find(function(err, users) {
                if (err)
                    res.send(err)
                res.json(users);
            });
        });
    });

    // get all projects
    app.get('/api/projects', function(req, res) {

        // use mongoose to get all projects in the database
        Project.find(function(err, projects) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.json(projects); // return all projects in JSON format
        });
    });

    // get a project
    app.get('/api/projects/:project_id', function(req, res) {
        Project.find({
            id : req.params.project
        }, function(err, project) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err);

            res.json(project); // return project in JSON format
        });
    });

    // create project and send back all projects after creation
    app.post('/api/projects', function(req, projects) {

        // create a project, information comes from AJAX request from Angular
        Project.create({
            id : req.body.text,
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the projects after you create another
            Project.find(function(err, projects) {
                if (err)
                    res.send(err)
                res.json(projects);
            });
        });

    });

    // delete a project
    app.delete('/api/projects/:project_id', function(req, res) {
        Project.remove({
            id : req.params.project_id
        }, function(err, project) {
            if (err)
                res.send(err);

            Project.find(function(err, projects) {
                if (err)
                    res.send(err)
                res.json(projects);
            });
        });
    });*/

};

