const mongoCollections = require("../mongo/collections");
const users = mongoCollections.users;
const uuid = require('uuid/v4');
const checkType = require('./Types/Typecheck');
const DatabaseError = require('./Error/DatabaseError');
const FormatError = require('./Error/FormatError')
const {itemType, sellerType, commentType} = require('./Types');

/*
*	Theodore Kluge
* 	Christopher Drew, Dakota Crouchelli
*/

/*
* 	add an item to inventory
* 	Usage: 	await addUser({email: '', name: '', hashedPassword: '', isShopowner: false});
*	@param 	email 			the email
*	@param 	name 			the display name
* 	@param 	hashedPassword 	hashed password
*	@param 	isShopowner		if user is a shopowner
* 	@return 				the new user
*/
async function addUser({email, name, hashedPassword, shopowner}) {
	if (!checkType({email: 'string'}, {email})) throw new FormatError("email must be a string");
	if (!checkType({name: 'string'}, {name})) throw new FormatError("name must be a string");
	if (!checkType({hashedPassword: 'string'}, {hashedPassword})) throw new FormatError("hashedPassword must be a string");
	if (!checkType({shopowner: 'boolean'}, {shopowner})) throw new FormatError("shopowner must be a boolean");

	if (await getUserByEmail(email)) throw new DatabaseError(400, 'Failed to add user: email already exists');

	const _id = uuid();
	const userItem = {
		_id,
		email,
		sessionId: null,
		hashedPassword,
		profile: {
			_id,
			name,
			shopowner,
		},
		cart: [],
		purchaseHistory: [],
	};

	const col = await users();
	const status = await col.insertOne(userItem);

	if (status.insertedCount === 0) throw new DatabaseError(500, `Failed to add user: ${email}`);
	return userItem;
}

/*
* 	get a user by its _id
*	@param 	id 		the _id of the inventory item to get
* 	@return 		the user
*/
async function getUser(id) {
	if (!checkType({id: 'string'}, {id})) throw new FormatError('id must be a string');
	const col = await users();
	const item = await col.findOne({
		_id: id
	});
	if (!item) throw new DatabaseError(404, `could not find user with _id: ${id}`);
	return item;
}

/*
* 	get a user by its email
*	@param 	email	the email of the inventory item to get
* 	@return 		the user
*/
async function getUserByEmail(email) {
	if (!checkType({email: 'string'}, {email})) throw new FormatError('email must be a string');
	const col = await users();
	const item = await col.findOne({
		email: email
	});
	if (!item) throw new DatabaseError(404, `could not find user with email: ${email}`);
	return item;
}

/*
* 	get a user by its session
*	@param  sID 	the session string
* 	@return 		the user
*/
async function getUserBySession(sID) {
	if (!checkType({sID: 'string'}, {sID})) throw new FormatError('sID must be a string');
	const col = await users();
	const item = await col.findOne({
		sessionId: sID,
	});
	if (!item) throw new DatabaseError(404, `could not find user with sessionId: ${sID}`);
	return item;
}

/*
* 	get all users
* 	@return	an array of users
*/
async function getUsers() {
	const col = await users();
	return (await col.find({}).toArray());
}

/*
*	set the user's session id
* 	@param 	id 		the user's _id
* 	@param 	session the session string
*	@return 		the session string
*/
async function setUserSession({id, session}) {
	if (!checkType({id: 'string'}, {id})) throw new FormatError('id must be a string');
	if (!checkType({session: 'string'}, {session})) throw new FormatError('session must be a string');

	const col = await users();
	const status = await col.updateOne({
		_id: id,
	}, {
		$set: {
			sessionId: session,
		},
	});
	if (status.modifiedCount === 0) throw new DatabaseError(500, `Failed to set session ${session} to user ${id}`);
	return session;
}

/*
*	Add an item to cart
* 	@param 	id 		the id of the user to add the item to
* 	@param 	item 	the item object to add
* 	@return 		the item
*/
async function addToCart({id, item}) {
	if (!checkType({id: 'string'}, {id})) throw new FormatError('id must be a string');
	if (!checkType(itemType, item)) throw new FormatError('item is wrong format', itemType);

	const col = await users();
	const status = await col.updateOne({
		_id: id,
	}, {
		$push: {
			cart: item,
		},
	});

	if (status.modifiedCount === 0) throw new DatabaseError(500, `Failed to add item ${item.id} to cart ${id}`);
	return item;
}

/*
*	Add to purchase history
* 	@param 	id 		the id of the user to add the item to
* 	@param 	item 	the item object to add
* 	@param 	price 	the price the item was bought for
* 	@return 		the purchase item
*/
async function addToHistory({id, item, price}) {
	if (!checkType({id: 'string'}, {id})) throw new FormatError('id must be a string');
	if (!checkType(itemType, item)) throw new FormatError('item is wrong format', itemType);
	if (!checkType({price: 'number'}, {price})) throw new FormatError('price must be a number');

	const pItem = {
		_id: uuid(),
		item,
		purchasePrice: price,
		timestamp: new Date(),
	};

	const col = await users();
	const status = await col.updateOne({
		_id: id,
	}, {
		$push: {
			purchaseHistory: pItem,
		},
	});

	if (status.insertedCount === 0) throw new DatabaseError(500, `Failed to add purchase: ${pItem.item.name}`);
	return pItem;
}

module.exports = {
	addUser,
	getUser,
	getUserByEmail,
	getUserBySession,
	getUsers,
	setUserSession,
	addToCart,
	addToHistory,
};
