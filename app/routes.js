
var passport = require('passport');
var User = require('./models/user');
var Project = require('./models/project');

// expose the routes to our app with module.exports
module.exports = function(app) {

    // home
    app.get('/home', function(req, res) {
        console.log(req.user);
        res.sendfile('./views/home.html');
    });

    // sla
    app.get('/sla', function(req, res) {
        res.sendfile('./views/sla.html');
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

    // api ---------------------------------------------------------------------
    // get all users
    app.get('/api/users', function(req, res) {

        // use mongoose to get all users in the database
        User.find(function(err, users) {

            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(users); // return all users in JSON format
        });
    });

    // get an user
    app.get('/api/users/:user_id', function(req, res) {
        User.find({
            id : req.params.user
        }, function(err, user) {
            // if there is an error retrieving, send the error. nothing after res.send(err) will execute
            if (err)
                res.send(err)

            res.json(user); // return user in JSON format
        });
    });

    // create user and send back all users after creation
    app.post('/api/users', function(req, res) {

        // create a user, information comes from AJAX request from Angular
        User.create({
            id : req.body.text,
            sla: 1,
            projects : []
        }, function(err, todo) {
            if (err)
                res.send(err);

            // get and return all the users after you create another
            Todo.find(function(err, users) {
                if (err)
                    res.send(err)
                res.json(users);
            });
        });

    });

    // delete a user
    app.delete('/api/users/:user_id', function(req, res) {
        Project.remove({
            id : req.params.user_id
        }, function(err, user) {
            if (err)
                res.send(err);

            Todo.find(function(err, users) {
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
                res.send(err)

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
                res.send(err)

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
            Todo.find(function(err, projects) {
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

            Todo.find(function(err, projects) {
                if (err)
                    res.send(err)
                res.json(projects);
            });
        });
    });
};

