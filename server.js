//Install express server
const express = require("express");
const path = require("path");

const app = express();

// let Heroku pick the port, otherwise use 8080 by default
const PORT = process.env.PORT ? process.env.PORT : 8080;

// Serve only the static files form the dist directory
app.use(express.static(__dirname + "/dist/vineyard-frontend"));

app.get("/*", function (req, res) {
  res.sendFile(path.join(__dirname + "/dist/vineyard-frontend/index.html"));
});

// Start the app by listening on the port
app.listen(PORT);
console.log("server listening on port ", PORT);
// finally add "node server.js" to our "start:" script in package.json
