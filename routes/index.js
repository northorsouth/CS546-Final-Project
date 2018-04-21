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

	app.get("/login", async function (req, res)
	{
		res.render("login")
	})

	app.post("/login", async function (req, res)
	{
		res.render("login")
	})

	app.get("/product", async function (req, res)
	{
		res.render("product")
	})

	app.get("/register", async function (req, res)
	{
		res.render("register")
	})

	app.get("/cart", async function (req, res)
	{
		res.render("cart")
	})

	app.get("/checkout", async function (req, res)
	{
		res.render("home")
	})

  app.get("/clearcart", async function (req, res)
  {
    res.render("home")
  })

  app.get("/logout", async function (req, res)
  {
    res.render("home")
  })
}
