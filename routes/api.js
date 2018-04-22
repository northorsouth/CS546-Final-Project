const express = require('express');
const router = express.Router();
const routerPublic = express.Router();
const Log = require('../common/Log');
const fs = require('fs');

const {inventory, users} = require("../data");

const TAG = 'api';

router.use(async (req, res, next) => {
	if (!req.cookies.AuthCookie) {
		Log.w(TAG, 'not logged in for protected api');
		res.redirect('/');
	} else {
		delete req.authUser;
		try {
			const user = await users.getUserBySession(req.cookies.AuthCookie);
			req.authUser = user._id;
			next();
		} catch (err) {
			Log.e(TAG, err);
			res.status(403).json({
				error: 'access denied'
			});
		}
	}
});

/*
*	GET /api/public/inventory
* 	@return 	object
*/
routerPublic.get('/inventory', async (req, res) => {
	try {
		const inv = await inventory.getItems();
		res.status(200).json(inv);
	} catch (e) {
		Log.e(TAG, e);
		res.status(404).json(e);
	}
});

/*
*	GET /api/public/inventory/{id}
* 	@return 	object
*/
routerPublic.get('/inventory/:id', async (req, res) => {
	try {
		const inv = await inventory.getItem(req.params.id);
		res.status(200).json(inv);
	} catch (e) {
		Log.e(TAG, e);
		res.status(404).json(e);
	}
});

routerPublic.get('/image/:id', async (req, res) => {
	//Log.d(`${__dirname}/../upload/${req.params.id}.jpg`);
	if (fs.existsSync(`${__dirname}/../upload/${req.params.id}.jpg`)) {
		fs.readFile(`${__dirname}/../upload/${req.params.id}.jpg`, (err, data) => {
			if (err) {
				res.status(404).json({
					error: 'could not read image'
				});
			} else {
				res.writeHead(200, {'Content-Type': 'image/jpeg'});
				res.end(data);
			}
		})
	} else if (fs.existsSync(`${__dirname}/../upload/${req.params.id}.png`)) {
		fs.readFile(`${__dirname}/../upload/${req.params.id}.png`, (err, data) => {
			if (err) {
				res.status(404).json({
					error: 'could not read image'
				});
			} else {
				res.writeHead(200, {'Content-Type': 'image/png'});
				res.end(data);
			}
		})
	} else {
		res.writeHead(200, {'Content-Type': 'image/png'});
		fs.readFile(`${__dirname}/../upload/placeholder.png`, (e, d) => {
			res.end(d);
		});
	}
});

/*
*	GET /api/user
* 	@return 	object
*/
router.get('/user', async (req, res) => {
	try {
		const user = await users.getUser(req.authUser);
		delete user._id;
		delete user.sessionId;
		delete user.hashedPassword;
		res.status(200).json(user);
	} catch (e) {
		Log.e(TAG, e);
		res.status(404).json(e);
	}
});

/*
*	POST /api/cart
* 	@return 	object
*/
router.post('/cart', async (req, res) => {
	try {
		const user = await users.getUser(req.authUser);
		const item = await users.addToCart({id: user.id, item: {
			_id: req.body.id,
			name: req.body.name,
			price: rqe.body.price,
		}});
		delete item._id;
		res.status(200).json(item);
	} catch (e) {
		Log.e(TAG, e);
		res.status(e.status || 500).json(e);
	}
});

/*
*	DELETE api/cart
*/
router.delete('/cart/:id', async (req, res) => {
	try {
		const user = await users.getUser(req.authUser);
		await users.removeFromCart({id: user._id, item: req.params.id});
		res.status(200).send();
	} catch (e) {
		Log.e(TAG, e);
		res.status(e.status || 500).json(e);
	}
});

/*
*	POST /api/checkout
* 	@return 	object
*/
router.post('/checkout', async (req, res) => {
	try {
		const user = await users.getUser(req.authUser);
		const cart = user.cart;
		for (const item of cart) {
			await users.addToHistory({id: user._id, item});
		}
		await users.clearCart(user._id);
		res.status(200).json({
			message: 'ok'
		});
	} catch (e) {
		Log.e(TAG, e);
		res.status(e.status || 500).json(e);
	}
});

module.exports = {
	routerPublic,
	router,
};
