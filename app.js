// Libraries
const express = require("express");
const bodyParser = require("body-parser");
const exphbs = require("express-handlebars");
const cookieMonster = require("cookie-parser");

// Declare folder locations
const static = express.static(__dirname + "/public");
const configRoutes = require("./routes");
const dbCollections = require("./mongo/collections")

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
const server = app.listen(3000, () =>
{
	console.log("We've now got a server!");
	console.log("Your routes will be running on http://localhost:3000");
	if (process && process.send) process.send({done: true});
});

// Graceful shutdown function
const shutdown = async function()
{
	try
	{
		console.log("Clearing database")
		await dbCollections.clearAll()
	}	catch (err) { console.log ("Could not clear database: " + err) }

	try
	{
		console.log("Stopping server")
		server.close(() => { process.exit() })
	}	catch (err) { console.log("Could not close server: " + err) }
}

// listen for TERM signal .e.g. kill 
process.on ('SIGTERM', shutdown)

// listen for INT signal e.g. Ctrl-C
process.on ('SIGINT', shutdown)
