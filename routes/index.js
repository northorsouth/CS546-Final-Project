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
		res.render("home", {loggedIn: req.hasOwnProperty("authUser")})
	})

	app.get("/login", async function (req, res)
	{
		if (req.hasOwnProperty("authUser"))
			res.redirect("/")
		else
			res.render("login")
	})

	app.post("/login", async function (req, res)
	{
		try
		{
			if (req.hasOwnProperty("authUser"))
			{
				res.render("error", {
					error: "Please log out before logging in again",
					loggedIn: true
				})
			}
			
			else
			{
				if (!req.body.email || (typeof req.body.email) !== "string")
				throw "Email not provided"

				if (!req.body.password || (typeof req.body.password) !== "string")
					throw "Password not Provided"

				user = await usersDB.getUserByEmail(req.body.email)

				if (!(await bcrypt.compare(req.body.password, user.hashedPassword)))
					throw "Password incorrect"

				const expiresAt = new Date();
				expiresAt.setHours(expiresAt.getHours() + 1);
				const sessionID = uuid();
				res.cookie("AuthCookie", sessionID, { expires: expiresAt });
				await usersDB.setUserSession({id: user._id, session: sessionID})

				res.redirect("/")
			}
		}

		catch (err)
		{
			if (typeof err === "string")
			{
				res.status(400).render("login",
				{
					error: err,
					loggedIn: false
				})
			}

			else
			{
				console.log(err.message)
				res.status(500).render("login",
				{
					error: "A server error occurred, please try again later",
					loggedIn: false
				})
			}
		}
	})

	app.get("/register", async function (req, res)
	{
		if (req.hasOwnProperty("authUser"))
		{
			res.render("error", {
				error: "Please log out before registering",
				loggedIn: true
			})
		}
		
		else
			res.render("register")
	})

	app.post("/register", async function (req, res)
	{
		try
		{
			if (req.hasOwnProperty("authUser"))
			{
				res.render("error", {
					error: "Please log out before registering",
					loggedIn: true
				})
			}
				
			else
			{
				if (!req.body.username || (typeof req.body.username) !== "string")
					throw "Name not provided"

				if (!req.body.email || (typeof req.body.email) !== "string")
					throw "Email not provided"

				if (!req.body.password || (typeof req.body.password) !== "string")
					throw "Password not provided"

				if (!/^\w+[\w\+\.]*@\w+\.\w+(?:\.\w+)*$/.test(req.body.email)) {
					throw "Invalid email address";
				}

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
			}
		}

		catch (err)
		{
			if (typeof err === "string")
			{
				res.status(400).render("register",
				{
					error: err,
					loggedIn: false
				})
			}

			else
			{
				console.log(err.message)
				res.status(500).render("register",
				{
					error: "A server error occurred, please try again later",
					loggedIn: false
				})
			}
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
				fruitPrice: fruit.item.price,
				fruitStars: avgRating,
				fruitPic: "/api/public/image/" + fruit._id
			})
		}

		catch (err)
		{
			console.log(err.message)
			res.redirect("/")
		}
	})

	app.post("/product/:id/review", async function (req, res)
	{
		try
		{
			if (!req.hasOwnProperty("authUser"))
			{
				res.render("login", {
					error: "Please log in before reviewing"
				})
			}

			else
			{
				const fruit = await inventoryDB.getItem(req.params.id)

				const user = await usersDB.getUser(req.authUser)

				if (!req.body.review || (typeof req.body.review) !== "string")
					throw "Missing review text"
				
				if (!req.body.stars || (typeof req.body.stars) !== "string")
					throw "Missing star rating"

				const newReview =
				{
					poster: user.profile,
					comment: req.body.review,
					rating: parseInt(req.body.stars),
					timestamp: new Date()
				}

				await inventoryDB.addComment({id: fruit._id, comment: newReview})

				res.redirect("/product/" + fruit._id)
			}
		}

		catch (err)
		{
			if (typeof err === "string")
			{
				res.status(400).render("error",
				{
					error: err,
					loggedIn: true
				})
			}

			else
			{
				console.log(err.message)
				res.status(500).render("error",
				{
					error: "A server error occurred, please try again later",
					loggedIn: true
				})
			}
		}
	})

	app.get("/product/:id/add", async function (req, res)
	{
		try
		{
			if (!req.hasOwnProperty("authUser"))
			{
				res.status(401).render("login")
				{
					error: "Please log in before adding item to cart"
				}
			}
			
			else
			{
				const fruit = await inventoryDB.getItem(req.params.id)

				await usersDB.addToCart({id: req.authUser, item: fruit.item})

				res.redirect("/cart")
			}
		}

		catch (err)
		{
			console.log(err.message)
			res.render("error", {error: "A server error occurred, please try again later."})
		}
	})

	app.get("/cart", async function (req, res)
	{
		if (!req.hasOwnProperty("authUser"))
		{
			res.status(401).render("login",
			{
				error: "Please log in to view your cart"
			})
		}

		else
			res.render("cart");
	})

	app.get("/checkout", async function (req, res)
	{
		if (!req.hasOwnProperty("authUser"))
		{
			res.status(401).render("login",
			{
				error: "Please log in before checking out"
			})
		}

		else
			res.render("checkout")
	})

	app.get("/history", async function (req, res)
	{
		try {
			if (!req.hasOwnProperty("authUser"))
				throw new Error("Please log in to view your purchase history");

			res.render("history");
		} catch (e) {
			res.render("error", {error: e.message})
		}
	})

	app.post("/checkout", async function (req, res) {
		try {
			if (!req.hasOwnProperty("authUser"))
			{
				res.status(401).render("login",
				{
					error: "Please log in before checking out"
				})
			}

			else
			{
				const id = req.authUser;

				const user = await usersDB.getUser(id);
				const cart = user.cart;

				for (const item of cart)
				{
					await usersDB.addToHistory({
						id,
						item,
						price: item.price
					});
					await inventoryDB.removeOne(item._id);
				}

				await usersDB.clearCart(id);

				res.redirect("/");
			}
		}
		
		catch (err)
		{
			console.log(err.message)
			res.status(501).render("cart", {error: "A server error occurred, please try again later."})
		}
	})

	app.get("/clearcart", async function (req, res)
	{
		try
		{
			usersDB.clearCart(req.authUser)
			res.redirect("/cart")
		}

		catch (err)
		{
			console.log(err.message)
			res.status(501).render("cart", {error: "A server error occurred, please try again later."})
		}
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
				console.log(err.message)
				res.status(501).render("/", {error: "A server error occurred, please try again later."})
			}
		}

		res.redirect("/")
	})
}
