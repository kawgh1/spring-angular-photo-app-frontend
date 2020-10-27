//Install express server
// const express = require('express');
// const path = require('path');

// const app = express();

// // Serve only the static files form the dist directory
// app.use(express.static(__dirname + '/dist/vineyard-frontend'));

// app.get('/*', function (req, res) {

//     res.sendFile(path.join(__dirname + '/dist/vineyard-frontend/index.html'));
// });

// // Start the app by listening on the default Heroku port
// app.listen(process.env.PORT || 8080, function () {
//     console.log("Express server listening on port %d in %s mode", this.address().port, app.settings.env);
// });

const express = require('express');
const app = express();
const path = require('path');


app.use(express.static(path.join(__dirname, '/dist/vineyard-frontend')));


app.get('/json', function (req, res) {
    console.log("GET the json");
    res
        .status(200)
        .json({ "jsonData": true });
});

app.get('/file', function (req, res) {
    console.log("GET the file");
    res
        .status(200)
        .sendFile(path.join(__dirname, 'app.js'));
});



var server = app.listen(process.env.PORT || 5000, function () {
    var port = server.address().port;
    console.log("Express is working on port " + port);
});