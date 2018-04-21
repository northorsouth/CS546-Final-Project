const data = require("../data")
const usersDB = data.users
const inventoryDB = data.inventory

// Configures the app
module.exports = function (app)
{
	/* Cookie flagging middleware
	// Searches for a cookie in every request, before it reaches the real routes
	// If a cookie is found vith a valid session-id, the request is marked with that user's index
	app.use(async function (req, res, next)
	{
		delete req.authUser
		
		if (req.cookies.AuthCookie)
			for (var i=0; i<users.length; i++)
				for (var j=0; j<users[i].sessions.length; j++)
					if (users[i].sessions[j] === req.cookies.AuthCookie)
						req.authUser = i

		next()
	})
	*/
	
	app.get("/", async function (req, res)
	{
		res.render("home")
	})
}