const data = require("../data")
const usersDB = data.users
const inventoryDB = data.inventory

// Configures the app
module.exports = function (app)
{
	// Cookie flagging middleware
	// Searches for a cookie in every request, before it reaches the real routes
	// If a cookie is found vith a valid session-id, the request is marked with that user's index
	app.use(async function (req, res, next)
	{
		delete req.authUser

		if (req.cookies.AuthCookie)
		{
			try
			{
				const user = await usersDB.getUserBySession(req.cookies.AuthCookie)

				req.authUser = user._id
			}

			catch (err)
			{
				console.log(err)
			}
		}

		next()
	})

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
		try
		{
			if (!req.body.username || (typeof req.body.username) !== "string")
				throw "No username in request body"
			
			
			if (!req.body.password || (typeof req.body.password) !== "string")
				throw "No password in request body"
			
			user = await usersDB.getUserByEmail(req.body.username)

			if (!(await bcrypt.compare(req.body.password, user.hashedPassword)))
				throw "Password incorrect"
			
			const expiresAt = new Date();
			expiresAt.setHours(expiresAt.getHours() + 1);
			const sessionID = uuid();
			res.cookie("AuthCookie", sessionID, { expires: expiresAt });
			await setUserSession(user._id, sessionID)
			
			res.redirect("/home")
		}
	
		catch (err)
		{
			/*res.status(400).render("login",
			{
				"error-occurred": true,
				"error-text": err
			})
			*/
			console.log(err)
		}
		
		res.render("home")
	})

	app.get("/register", async function (req, res)
	{
		res.render("register")
	})

	app.post("/register", async function (req, res)
	{
		res.render("register")
	})

	app.get("/product", async function (req, res)
	{
		res.render("product")
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
