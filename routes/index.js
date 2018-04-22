const data = require("../data")
const bcrypt = require("bcrypt")
const uuid = require("uuid/v4")
const api = require('./api');

const usersDB = data.users
const inventoryDB = data.inventory

const saltRounds = 16;

// Configures the app
module.exports = function (app)
{

	app.use('/api/public', api.routerPublic);
	app.use('/api', api.router);

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
				console.log(err.message)
			}
		}

		next()
	})

	app.get("/", async function (req, res)
	{
		var loggedIn = false

		if (req.hasOwnProperty("authUser"))
			loggedIn = true
		
		res.render("home", {loggedIn: loggedIn})
	})

	app.get("/login", async function (req, res)
	{
		if (req.hasOwnProperty("authUser"))
			res.status(303).redirect("/")
		else
			res.render("login")
	})

	app.post("/login", async function (req, res)
	{
		try
		{
			if (req.hasOwnProperty("authUser"))
				res.render("error", {
					error: "Please log out before logging in again",
					loggedIn: true
				})
			
			else
			{
				if (!req.body.email || (typeof req.body.email) !== "string")
				throw new Error("No email in request body")

				if (!req.body.password || (typeof req.body.password) !== "string")
					throw new Error("No password in request body")

				user = await usersDB.getUserByEmail(req.body.email)

				if (!(await bcrypt.compare(req.body.password, user.hashedPassword)))
					throw new Error("Password incorrect")

				const expiresAt = new Date();
				expiresAt.setHours(expiresAt.getHours() + 1);
				const sessionID = uuid();
				res.cookie("AuthCookie", sessionID, { expires: expiresAt });
				await usersDB.setUserSession({id: user._id, session: sessionID})

				res.redirect("/")
			}

			return
		}

		catch (err)
		{
			res.render("login",
			{
				"error": err.message
			})
		}
	})

	app.get("/register", async function (req, res)
	{
		if (req.hasOwnProperty("authUser"))
			res.render("error", {
				error: "Please log out before registering",
				loggedIn: true
			})
		
		else
			res.render("register")
	})

	app.post("/register", async function (req, res)
	{
		try
		{
			if (req.hasOwnProperty("authUser"))
				res.render("error", {
					error: "Please log out before registering",
					loggedIn: true
				})
				
			else
			{
				if (!req.body.username || (typeof req.body.username) !== "string")
					throw new Error("No name in request body")

				if (!req.body.email || (typeof req.body.email) !== "string")
					throw new Error("No email in request body")

				if (!req.body.password || (typeof req.body.password) !== "string")
					throw new Error("No password in request body")

				bcrypt.hash(req.body.password, saltRounds, async function(err, hashedPassword)
				{
					await usersDB.addUser({
						email: req.body.email,
						name: req.body.username,
						hashedPassword,
						shopowner: false
					});
				})

				res.redirect("/")

				return
			}
		}

		catch (err)
		{
			res.render("register",
			{
				"error": err.message
			})
		}
	})

	app.get("/product/:id", async function (req, res)
	{
		try
		{
			const fruit = await inventoryDB.getItem(req.params.id)
			
			const avgRating = fruit.comments.length ? 
				(fruit.comments.reduce((a, c) => a + c.rating, 0) / fruit.comments.length) : 
				0
			
			res.render("product",{
				loggedIn: req.hasOwnProperty("authUser"),
				fruitID: fruit._id,
				fruitStock: fruit.count,
				fruitType: fruit.item.name,
				fruitStars: avgRating,
				fruitPic: "/api/public/image/" + fruit._id
			})
		}

		catch (err)
		{
			res.render("error", {error: err.message})
		}
	})

	app.post("/product/:id/review", async function (req, res)
	{

	})

	app.get("/product/:id/add", async function (req, res)
	{
		try
		{
			if (!req.hasOwnProperty("authUser"))
				throw new Error("Please log in before adding item to cart")
			
			const fruit = await inventoryDB.getItem(req.params.id)

			await usersDB.addToCart({id: req.authUser, item: fruit.item})

			res.redirect("/cart")
		}

		catch (err)
		{
			res.render("error", {error: err.message})
		}
	})

	app.get("/cart", async function (req, res)
	{
		res.render("cart")
	})

	app.get("/checkout", async function (req, res) {
		try {
			if (!req.hasOwnProperty("authUser"))
				throw new Error("Please log in before checking out")
			
			const id = req.authUser;

			const user = await usersDB.getUser(id);
			const history = user.history;

			for (const item of history) {
				await usersDB.addToHistory({
					id,
					item,
					price: item.price
				});
			}

			await usersDB.clearCart(id);

			res.render("checkout");
		} catch (err) {
			res.render("error", {error: err.message})
		}
	})

	app.get("/clearcart", async function (req, res)
	{
		console.log("Clearing cart")
		
		if (req.hasOwnProperty("authUser"))
		{
			try
			{
				console.log("making db call")
				usersDB.clearCart(req.authUser)
			}

			catch (err)
			{
				console.log(err.message)
				res.render("/cart", {error: err.message})
				return
			}
		}

		console.log("refreshing")
		res.redirect("/cart")
	})

	app.get("/logout", async function (req, res)
	{
		if (req.hasOwnProperty("authUser"))
		{
			try
			{
				res.clearCookie("AuthCookie")
				await usersDB.setUserSession({id: user._id, session: ""})
			}

			catch (err)
			{
				res.render("error", {error: err.message})
			}
		}

		res.redirect("/")
	})
}
