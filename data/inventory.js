const mongoCollections = require("../mongo/collections");
const inventory = mongoCollections.inventory;
const uuid = require('uuid/v4');
const checkType = require('./Types/Typecheck');
const DatabaseError = require('./Error/DatabaseError');
const FormatError = require('./Error/FormatError');
const {itemType, sellerType, commentType} = require('./Types');

/*
* 	add an item to inventory
* 	Usage: 	await addItem({item, seller, count: 1});
*	@param 	item 	the item object
*	@param 	seller 	the user profile
* 	@param 	count 	the number of items there are
* 	@return 		the new item
*/
async function addItem({item, seller, count}) {
	if (!checkType(itemType, item)) throw new FormatError("item object is wrong format: expected ", itemType);
	if (!checkType(sellerType, seller)) throw new FormatError("seller object is wrong format: expected ", sellerType);
	if (!checkType({count: Number}, {count})) throw new FormatError("count must be a number");

	const invItem = {
		_id: uuid(),
		count,
		item,
		seller,
		comments: [],
	};

	const col = await inventory();
	const status = await col.insertOne(invItem);

	if (status.insertedCount === 0) throw new DatabaseError(500, `Failed to add item: ${item.name}`);
	return invItem;
}

/*
* 	get an inv item by its _id
* 	Usage: 	await getItem('x');
*	@param 	id 		the _id of the inventory item to get
* 	@return 		the item
*/
async function getItem(id) {
	if (!checkType({id: 'string'}, {id})) throw new FormatError("id must be a string");
	const col = await inventory();
	const item = await col.findOne({
		_id: id
	});
	if (!item) throw new DatabaseError(404, `could not find item with _id: ${id}`);
	return item;
}

/*
* 	add get all items from inventory
* 	Usage: 	await getItems();
* 	@return	an array of items
*/
async function getItems() {
	const col = await inventory();
	return (await col.find({}).toArray());
}

/*
* 	add a comment to an inventory item
* 	Usage: 	await addComment({id: 'x', comment: y});
*	@param 	id 		the _id of the inventory item to add to
*	@param 	comment the comment object
* 	@return 		the new comment
*/
async function addComment({id, comment}) {
	if (!checkType({id: 'string'}, {id})) throw new FormatError('id must be a string');
	if (!checkType(commentType, comment)) throw new FormatError('comment object is wrong format', commentType);

	const cItem = {
		_id: uuid(),
		...comment,
	};

	const col = await inventory();
	const status = await col.updateOne({
		_id: id,
	}, {
		$push: {
			comments: cItem,
		},
	});
	if (status.modifiedCount === 0) throw new DatabaseError(500, `Failed to add comment to item ${id}`);
	return cItem;
}

/*
{
	"_id":"7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
	"count": 452,
	"seller": {
		"_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6311",
		"name": "Test Shopowner",
		"shopowner": true
	},
	"item": {
		"_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6310",
		"name":"Pineapple",
		"price": 0.00
	},
	"comments": [
		{
			"_id": "d7a44a10-0de3-44ad-9c58-5f3fe8f1c0d3",
			"poster": {
				"_id": "7b7997a2-c0d2-4f8c-b27a-6a1d4b5b6311",
				"name": "Test Shopowner",
				"shopowner": true
			},
			"comment": "It's okay, I guess.",
			"rating": 3,
			"timestamp": 00000000
		}
	]
}
*/
