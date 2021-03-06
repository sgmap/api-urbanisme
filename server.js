const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const ObjectID = require('mongodb').ObjectID;
const getCollection = require('./lib/mongodb').getCollection;

getCollection()
    .then(servColl => {
        const app = express();

        app.use(cors());
        app.use(bodyParser.json());

        // Inject collection
        app.use(function (req, res, next) {
            req.servColl = servColl;
            next();
        });

        app.post('/servitudes', function (req, res, next) {
            servColl
                .find({ assiette: { $geoIntersects: { $geometry: req.body.geom } } })
                .project({ assiette: 0, generateur: 0 })
                .toArray(function (err, servitudes) {
                    if (err) return next(err);
                    res.send(servitudes);
                });
        });

        app.get('/servitudes/:servId', function (req, res, next) {
            servColl
                .findOne({ _id: ObjectID.createFromHexString(req.params.servId) }, function (err, servitude) {
                    if (err) return next(err);
                    res.send(servitude);
                });
        });

        const listenPort = process.env.PORT || 5000;

        app.listen(listenPort, function () {
            console.log('Start listening on port ' + listenPort);
        });
    })
    .catch(err => {
        console.error(err);
        process.exit(1);
    });
