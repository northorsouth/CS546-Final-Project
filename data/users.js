const mongoCollections = require("../mongo/collections");
const users = mongoCollections.users;
const uuid = require('uuid/v4');
const checkType = require('./Typecheck');
const DatabaseError = require('./Error/DatabaseError');
const FormatError = require('./Error/FormatError')
const {itemType, sellerType, commentType} = require('./Types');

/*
* 	add an item to inventory
* 	Usage: 	await addUser({email: '', name: '', hashedPassword: '', isShopowner: false});
*	@param 	email 			the email
*	@param 	name 			the display name
* 	@param 	hashedPassword 	hashed password
*	@param 	isShopowner		if user is a shopowner
* 	@return 				the new user
*/
async function addUser({email, name, hashedPassword, isShopowner}) {
	if (!checkType({email: 'string'}, {email})) throw new FormatError("email must be a string");
	if (!checkType({name: 'string'}, {name})) throw new FormatError("name must be a string");
	if (!checkType({hashedPassword: 'string'}, {hashedPassword})) throw new FormatError("hashedPassword must be a string");
	if (!checkType({isShopowner: Boolean}, {isShopowner})) throw new FormatError("isShopowner must be a Boolean");

	const _id = uuid();
	const userItem = {
		_id:,
		email,
		sessionId: null,
		hashedPassword,
		profile: {
			_id,
			name,
			shopowner: isShopowner,
		},
		cart: [],
		purchaseHistory: [],
	};

	const col = await users();
	const status = await col.insertOne(userItem);

	if (status.insertedCount === 0) throw new DatabaseError(500, `Failed to add user: ${email}`);
	return userItem;
}

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

async function addToHistory({id, item, price}) {
	if (!checkType({id: 'string'}, {id})) throw new FormatError('id must be a string');
	if (!checkType(itemType, item)) throw new FormatError('item is wrong format', itemType);
	if (!checkType({price: Number}, {price})) throw new FormatError('price must be a Number');

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
