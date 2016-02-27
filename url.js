var newserver = require('express');
var app = newserver();
var path = require('path');
var database = require('mongodb');

database.MongoClient.connect(process.env.MONGOLAB_URI || 'mongodb://localhost:27017/url-shortener', function(err, db) {

    if (err) {
        throw new Error('Database failed to connect!');
    } else {
        console.log('Successfully connected to MongoDB on port 27017.');
    }

   db.createCollection("sites", {
        capped: true,
        size: 5242880,
        max: 5000
    });


    app.get('/:url', function (req, res) {
        var url = process.env.APP_URL + req.params.url;
        if (url != process.env.APP_URL + 'favicon.ico') {
              var sites = db.collection('sites');
            sites.findOne({
                "short_url": url
            }, function(err, result) {
                if (err) throw err;
                // object of the url
                if (result) {
                    res.redirect(result.original_url);
                } else {
                    res.send('This query is not available');
                }
            });
        }
    });

    app.get('/newurl/:url*', function (req, res) {
        var url = req.url.slice(8);
        var urlobj = {};
        if (validateURL(url)) {
            urlobj = {
                "original_url": url,
                "short_url": process.env.APP_URL + Math.floor(100000 + Math.random() * 900000).toString().substring(0,5)
            };
            var sites = db.collection('sites');
            sites.save(urlobj, function(err, result) {
                if (err) throw err;
            });
        } else {
            urlobj = {
                "error": "Are you sure it is an URL?"
            };
        }
        res.send(urlObj);
    });

    // Regex from https://gist.github.com/dperini/729294
    function validating(a) {
            var reg = /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i;
        return reg.test(a);
    }


});

    app.listen(process.env.PORT || 3500);
    app.get('/', function(req, res) {
        var fileName = path.join(__dirname, 'index.html');
        res.sendFile(fileName, function (err) {
            if (err) {
                res.status(err.status).end();
            }
        });
    });

    app.get('/newurl', function(req, res) {

        res.status(500).send('Oh my God! You are trying to access directly without putting URL');

    });



