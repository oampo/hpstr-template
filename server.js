var path = require('path');

var express = require('express');
var swig = require('swig');
var multer = require('multer');

var hipsterize = require('./hipsterize');

var app = express();

// Serve static files from public directory
app.use(express.static('public'));

// Use Swig to render templates
app.engine('html', swig.renderFile);
app.set('view engine', 'html');
swig.setDefaults({ cache: false });

// Upload avatars to upload/image/avatar directory
var avatarUpload = multer({
    dest: 'upload/image/avatar/'
});

var users = {};

// The user profile
app.get('/user/:username', function(req, res) {
    if (!req.params ||
        !req.params.username ||
        !(req.params.username in users)) {
        return res.sendStatus(404);
    }

    res.render('view-user', users[req.params.username]);
});

// Add a new user
app.get('/add-user', function(req, res) {
    res.render('add-user', {});
});

app.post('/add-user', avatarUpload.single('avatar'), function (req, res) {
    if (!req.body || !req.body.username || !req.file) {
        // Information missing from the request
        return res.sendStatus(400);
    }

    var username = req.body.username;

    if (username in users) {
        // User with that username already exists
        return res.sendStatus(409);
    }

    users[username] = {
        username: username,
        // Default avatar
        avatar: 'http://api.adorable.io/avatars/200/hipster@adorable.io.png'
    };

    var inputPath = req.file.path;
    var mimetype = req.file.mimetype;
    var serverOutputPath = path.join('/image/avatar/', username + '.png');
    var localOutputPath = path.join('public/', serverOutputPath);
    hipsterize(inputPath, mimetype, localOutputPath, function(err) {
        if (err) {
            return res.sendStatus(500);
        }

        users[username].avatar = serverOutputPath;
        return res.redirect(path.join('/user', username));
    });
});

app.listen(8080, function() {
    console.log("Listening on http://localhost:8080");
});
