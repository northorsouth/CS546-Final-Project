// Libraries
const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cookieMonster = require("cookie-parser");

// Declare folder locations
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");

// Initialize/Configure Server
const app = express();
app.use("/public", static);
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.engine("handlebars", exphbs());
app.set("view engine", "handlebars");
app.use(cookieMonster());
configRoutes(app);

app.use("*", (req, res) => {
	res.status(404).json({
		status: 404,
		error: `The resource '${req.originalUrl}' could not be found.`
	});
});

// Start Server
app.listen(3000, () =>
{
	console.log("We've now got a server!");
	console.log("Your routes will be running on http://localhost:3000");
	if (process && process.send) process.send({done: true});
});
