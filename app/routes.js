
var passport = require('passport');
var User = require('./models/user');
var Project = require('./models/project');
var https = require('https');
var http = require('http');
var webhook = require("../config/webhook.json");
var alt = 0;


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
        //res.redirect('http://whalee.io');
        res.sendfile('./views/index.html');
    });

    app.get('/auth', passport.authenticate('github', {scope: ['user', 'repo', 'repo_deployment', 'public_repo', 'gist', 'admin:repo_hook']}));

    app.get('/auth/callback', 
        passport.authenticate('github', {successRedirect: '/home',
                        failureRedirect:'/error'}));

    app.get('/logout', function (req, res){
        req.session.destroy(function (err) {
            res.clearCookie('connect.sid');
            res.redirect('/'); //Inside a callback… bulletproof!
        });
    });

    // local api ----------------------------------------------------------------------

    app.get('/api/user', function(req, res) {
        if(req.user)
            res.json(req.user); // return user in JSON format
        else
            res.redirect('/');     
    });

    // change sla for current user
    app.post('/api/sla/:id', function(req, res) {
        if(req.user){
            console.log("JE RECUPERE " + req.params.id + " EN ENTREE");
            req.user.sla = req.params.id;

            req.user.save(function(err) {
                if (err)
                    res.send(err);
                console.log(req.user);
                res.json(req.user);
            });
        } else {
            res.redirect('/');     
        }
    });

    // get a project deployed to whalee by ID
    app.get('/api/projects/deployed/:id', function(req, res) {
        if(req.user){
            Project.findOne({githubID : req.params.id}, function(err, project) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                res.json(project); // return project in JSON format
            });
        } else {
            res.redirect('/');
        }
    });

    // get all projects deployed to whalee
    app.get('/api/projects/deployed', function(req, res) {
        if(req.user){
            var result = [];
            console.log("user : " + req.user);
            var c = req.user.projects.length;
            if(c == 0)
                res.json(result);
            req.user.projects.forEach(function(element, index, array) {
                Project.findOne({githubID : element}, function(err, project) {
                    if (err)
                        res.send(err);

                    result.push(project); 
                    c--;
                    if(c == 0) {
                        console.log("return : " + result);
                        res.json(result);
                    }                
                });
            });
        } else {
            res.redirect('/');
        }
    });

    app.delete('/api/projects/deployed/:id', function(req, res) {
        if(req.user){
            Project.findOne({githubID : req.params.id}, function(err, project) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);
                if (project) {
                    for(var i = 0 ; i < req.user.projects.length ; i++) {
                        if(req.user.projects[i] == project.githubID) {
                            req.user.projects.splice(i, 1);
                            req.user.save(function(err) {
                                if (err)
                                    throw err;
                            });
                            break;
                        }
                    }

                    Project.remove({
                        githubID : req.params.id
                    }, function(err, user) {
                        if (err)
                            res.send(err);
                    });

                    res.status(200).send(); // return project in JSON format
                } else {
                    res.status(404).send("Project not found");
                }
            });      
        } else {
            res.redirect('/');
        }
    });

    // mika api ---------------------------------------------------------------------
    app.post('/api/projects/fakedeploy', function(req, res) {
        Project.findOne({ 'githubID' : req.body.id }, function (err, project) {
            if (err)
                return done(err);

            if (project) { 
                    res.send("project already deployed");                
            } else {
                    var newProject = new Project();
                    newProject.githubID = req.body.id;
                    newProject.name = req.body.name;
                    newProject.owner = req.body.owner.login;
                    newProject.cloneUrl = req.body.clone_url;
                    newProject.deployed = '1';
                    newProject.hooked = '0';
                    newProject.webhookID = '0';
                    newProject.save(function(err) {
                    if (err)
                        throw err;
                    });

                    req.user.projects.push(req.body.id);
                    req.user.save(function(err) {
                    if (err)
                        throw err;
                    });

                    res.json(newProject);
            }
        });
    });

    // deploy a project
    app.post('/api/projects/deployed', function(req, res) {
        if(req.user){
            Project.findOne({ 'githubID' : req.body.id }, function (err, project) {
                if (err)
                    return done(err);

                /*var filtered = req.user.projects.filter(function (id) {return id == project.githubID;});

                if (filtered.length == 0) {
                    User.update({id : req.user.id}, {
                        projects : req.user.projects.push(req.body.id)
                    }, function(err, numberAffected, rawResponse) {
                    });
                }*/

                if (project) { 
                    res.send("project already deployed");
                } else {
                    var data = { "user" : req.body.owner.login,
                                 "project" : req.body.name
                               };
                    var dataStr = JSON.stringify(data);


                    console.log("DATA : " + dataStr)

                    var options = {
                        host : 'localhost', // here only the domain name  @@@@@ TO DO @@@@@
                        // (no http/https !)
                        port : 4200,
                        path : '/project/', // the rest of the url with parameters if needed
                        headers: {
                            "Content-Type": "application/json",
                            "Content-Length": Buffer.byteLength(dataStr)
                        },
                        method : 'POST' // do POST
                    }

                    var post_req = http.request(options, function(res2) {
                        console.log('STATUS: ' + res2.statusCode);
                        console.log('HEADERS: ' + JSON.stringify(res2.headers));
                        res2.setEncoding('utf8');
                        str = "";
                        res2.on('data', function (chunk) {
                            str += chunk;
                        });

                        res2.on('end', function () {
                            console.log(str);
                            var result = JSON.parse(str);
                            var newProject = new Project();
                            newProject.githubID = req.body.id;
                            newProject.name = req.body.name;
                            newProject.owner = req.body.owner.login;
                            newProject.cloneUrl = req.body.clone_url;
                            newProject.deployed = '1';
                            newProject.hooked = '0';
                            newProject.webhookID = '0';
                            newProject.coreID = result.id;
                            newProject.save(function(err) {
                                if (err)
                                    throw err;
                            });

                            req.user.projects.push(req.body.id);
                            req.user.save(function(err) {
                            if (err)
                                throw err;
                            });

                            res.json(newProject);
                        });
                    }).on('error', function(e) {console.log("Got error: " + e.message);});
                    
                    post_req.write(dataStr);
                    post_req.end(); 
                }
            });
        } else {
            res.redirect('/');
        }
    });

    // redeploy a project @@@@@ CORE DON'T HANDLE IT
    app.post('/api/projects/deployed/:id/redeploy/', function(req, res) {
        if(req.user){
            Project.findOne({githubID : req.params.id}, function(err, project) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                if (project == null)
                    res.send("project doesn't exist");

                var options = {
                    host : 'localhost', // here only the domain name  @@@@@ TO DO @@@@@
                    // (no http/https !)
                    port : 4200,
                    path : '/project/' + project.coreID, // the rest of the url with parameters if needed
                    headers: {
                    },
                    method : 'POST' // do POST
                }

                http.request(options, function(res2) {
                    console.log('STATUS: ' + res2.statusCode);
                    console.log('HEADERS: ' + JSON.stringify(res2.headers));
                    res2.setEncoding('utf8');
                    str = "";
                    res2.on('data', function (chunk) {
                        str += chunk;
                    });

                    res2.on('end', function () {
                        console.log(str);
                        var result = JSON.parse(str);
                        res.json(result);
                    });
                }).on('error', function(e) {console.log("Got error: " + e.message);}).end();   
            });
        } else {
            res.redirect('/');
        }
    });
    
   // get data from project 
    app.get('/api/projects/deployed/:id/data', function(req, res) {
        if(req.user){
            Project.findOne({githubID : req.params.id}, function(err, project) {
                // if there is an error retrieving, send the error. nothing after res.send(err) will execute
                if (err)
                    res.send(err);

                if (project) { 
                    var options = {
                        host : 'localhost', // here only the domain name  @@@@@ TO DO @@@@@
                        // (no http/https !)
                        port : 4200,
                        path : '/project/' + project.coreID, // the rest of the url with parameters if needed
                        method : 'GET' // do POST
                    }

                    http.request(options, function(res2) {
                        console.log('STATUS: ' + res2.statusCode);
                        console.log('HEADERS: ' + JSON.stringify(res2.headers));
                        res2.setEncoding('utf8');
                        str = "";
                        res2.on('data', function (chunk) {
                            str += chunk;
                        });


                        res2.on('end', function () {
                            if(str) {
                            console.log(str);
                            var ct = JSON.parse(str);
                            var data = [];
                            for(var i = 0 ; i < ct.length ; i++) {
                                options.path = '/container/' + ct[i];
                                http.request(options, function(res3) {
                                    console.log('STATUS: ' + res3.statusCode);
                                    console.log('HEADERS: ' + JSON.stringify(res3.headers));
                                    res3.setEncoding('utf8');
                                    str = "";
                                    res3.on('data', function (chunk) {
                                        str += chunk;
                                    });

                                    res3.on('end', function () {
                                        data.push({"id" : ct[i], "data" : JSON.parse(str)});
                                        if(i == ct.length-1) {
                                            if (data)
                                                res.json(data);
                                            else
                                                res.status(404).send();
                                        }

                                    });
                                });               
                            }
                        }});
                    }).on('error', function(e) {console.log("Got error: " + e.message);}).end();
                } else {
                    res.send("project doesn't exist")
                }   
            });
        } else {
            res.redirect('/');
        }
    });
    

    app.get('/api/projects/deployed/:id/data/fake', function(req, res) {
        if(req.user){
            console.log("ALT = " + alt);
            var str = 
                [{
                    "id" : "julienbiau/blabla", 
                    "data" :
                        {
                          "proc": {
                            "max": 100.0,
                            "cur": 10.0,
                            "hist": [1, 2, 3, 4, 5, 6, 7, 8, 9, 8]
                          },
                            "disk": {
                            "max": 128.0,
                            "cur": 1.0,
                            "hist": [1, 2, 3, 4, 5, 6, 7, 8, 9, 8]
                          },
                          "memory": {
                            "max": 128.0,
                            "cur": 1.0,
                            "hist": [1, 2, 3, 4, 5, 6, 7, 8, 9, 8]
                          }
                        }
                },
                {
                    "id" : "julienbiau/blabla2", 
                    "data" :
                        {
                          "proc": {
                            "max": 100.0,
                            "cur": 10.0,
                            "hist": [1, 7, 3, 4, 5, 6, 2, 8, 2, 8]
                          },
                          "disk": {
                            "max": 128.0,
                            "cur": 1.0,
                            "hist": [1, 2, 3, 2, 5, 6, 2, 8, 2, 8]
                          },
                          "memory": {
                            "max": 128.0,
                            "cur": 1.0,
                            "hist": [1, 2, 3, 2, 5, 6, 2, 8, 9, 8]
                          }
                        }
                }];

            var str2 = 
                [{
                    "id" : "julienbiau/blabla", 
                    "data" :
                        {
                          "proc": {
                            "max": 100.0,
                            "cur": 10.0,
                            "hist": [1, 7, 3, 4, 5, 6, 2, 8, 2, 8]
                          },
                          "disk": {
                            "max": 128.0,
                            "cur": 1.0,
                            "hist": [1, 2, 3, 2, 5, 6, 2, 8, 2, 8]
                          },
                          "memory": {
                            "max": 128.0,
                            "cur": 1.0,
                            "hist": [1, 2, 3, 2, 5, 6, 2, 8, 9, 8]
                          }
                        }
                },
                {
                    "id" : "julienbiau/blabla2", 
                    "data" :
                        {
                          "proc": {
                            "max": 100.0,
                            "cur": 10.0,
                            "hist": [1, 2, 3, 4, 5, 6, 7, 8, 9, 8]
                          },
                            "disk": {
                            "max": 128.0,
                            "cur": 1.0,
                            "hist": [1, 2, 3, 4, 5, 6, 7, 8, 9, 8]
                          },
                          "memory": {
                            "max": 128.0,
                            "cur": 1.0,
                            "hist": [1, 2, 3, 4, 5, 6, 7, 8, 9, 8]
                          }
                        }

                }];

            if(alt == 0) {
                console.log("STR : " + JSON.stringify(str));
                res.json(str);
                alt = 1;
            } else {
                console.log("STR : " + JSON.stringify(str2));
                res.json(str2);
                alt = 0;
            }

        } else {
            res.redirect('/');
        }
    });

    // github api ---------------------------------------------------------------------

    // get all github projects
    app.get('/api/projects', function(req, res) {
        if(req.user) {
            // return user in JSON format
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
                //console.log('STATUS: ' + res2.statusCode);
                //console.log('HEADERS: ' + JSON.stringify(res2.headers));
                res2.setEncoding('utf8');
                str = "";
                res2.on('data', function (chunk) {
                    str += chunk;
                });

                res2.on('end', function () {
                    //console.log(str);
                    res.json(JSON.parse(str));
                });

            }).on('error', function(e) {console.log("Got error: " + e.message);}).end();      

        } else {
            res.redirect('/');  
        }
    });

    // enable auto deploy
    app.post('/api/projects/deployed/:id/enableautodeploy', function(req, res) {
        if(req.user) {
            Project.findOne({githubID : req.params.id}, function(err, project) {
                if (err)
                    res.send(err);

                if (project) {  

                    var post_data = JSON.stringify(webhook);

                    var options = {
                        host : 'api.github.com', // here only the domain name
                        // (no http/https !)
                        port : 443,
                        path : '/repos/' + project.owner + '/' + project.name + '/hooks',
                        //data : JSON.stringify(webhook),
                        headers : {
                            "Authorization" : "Bearer " + req.user.githubToken, 
                            "User-Agent" : "Whalee-webapp", // GitHub is happy with a unique user agent 
                            "Content-Type" : "application/json",
                            "Content-Length" : Buffer.byteLength(post_data)
                        },
                        method : 'POST'
                    };

                    console.log("PATH : " + options.path);
                    console.log("HEADERS : " + JSON.stringify(options.headers));
                    console.log("DATA : " + options.data);
                    var post_req = https.request(options, function(res2) {
                        console.log('STATUS ENABLE: ' + res2.statusCode);
                        //console.log('HEADERS: ' + JSON.stringify(res2.headers));
                        res2.setEncoding('utf8');
                        str = "";
                        res2.on('data', function (chunk) {
                            str += chunk;
                        });

                        res2.on('end', function () {
                            result = JSON.parse(str);
                            project.hooked = '1';
                            project.webhookID = result.id;
                            project.save(function(err) {
                                if (err)
                                    throw err;
                            });
                            console.log(result);
                            res.json(result);
                        });
                    }).on('error', function(e) {console.log("Got error: " + e.message);});

                    post_req.write(post_data);
                    post_req.end();

                } else {
                    res.status(404).send("project doesn't exist");
                }
            });

        } else {
            res.redirect('/');  
        }
    });
      
    // disable autodeploy
    app.post('/api/projects/deployed/:id/disableautodeploy', function(req, res) {  
        if(req.user) {
            Project.findOne({githubID : req.params.id}, function(err, project) {
                if (err)
                    res.send(err);

                if (project) { 
                    var options = {
                        host : 'api.github.com', // here only the domain name
                        // (no http/https !)
                        port : 443,
                        path : '/repos/' + project.owner + '/' + project.name + '/hooks/' + project.webhookID,
                        headers: {
                            "Authorization" : "Bearer " + req.user.githubToken, 
                            "User-Agent" : "Whalee-webapp" // GitHub is happy with a unique user agent 
                        },
                        method : 'DELETE'
                    };  

                    console.log("PATH : " + options.path);
                    console.log("HEADERS : " + JSON.stringify(options.headers));
                    https.request(options, function(res2) {
                        console.log('STATUS DISABLE: ' + res2.statusCode);
                        //console.log('HEADERS: ' + JSON.stringify(res2.headers));
                        res2.on('end', function () {
                            project.hooked = '0';
                            project.webhookID = '0';
                            project.save(function(err) {
                                if (err)
                                    throw err;
                            });
                            console.log(result);
                            res.status(200).send();
                        });
                    }).on('error', function(e) {console.log("Got error: " + e.message);}).end();      
                } else {
                    res.status(404);send("project doesn't exist");
                }
            });
        } else {
            res.redirect('/');  
        }
    });

    // push detected (webhooks)
    app.post('/push', function(req, res) {
        console.log("PUSH DETECTED");
        Project.findOne({githubID : req.body.repository.id}, function(err, project) {
            if (err)
                res.send(err);

            if (project) { 
                //res.redirect('/api/projects/deployed/' + project.githubID + '/redeploy');
                project.deployed = '1';
                project.save(function(err) {
                    if (err)
                        throw err;
                });
            } else {
                res.status(404).send("project doesn't exist");
            }
        });
    });
}

