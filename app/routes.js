
// expose the routes to our app with module.exports
module.exports = function(app) {

    // api ---------------------------------------------------------------------
    // home
    app.get('/home', function(req, res) {
        res.sendfile('./views/home.html');
    });

    // sla
    app.get('/sla', function(req, res) {
        res.sendfile('./views/sla.html');
    });

    // index
    app.get('/', function(req, res) {
        res.sendfile('./views/index.html');
    });

};