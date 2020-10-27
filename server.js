//require express
const express = require('express');
const app = express();
const path = require('path');

app.use(express.static(__dirname + '/dist'));

app.listen(process.env.PORT || 8080);

// Path location strategy

// allows angular to handle the routing instead of the server
app.get('/*', function (req, res) {
    res.sendFile(path.join(__dirname + '/dist/index.html'));
});

console.log('Console listening!');

// finally add "node server.js" to our "start:" script in package.json