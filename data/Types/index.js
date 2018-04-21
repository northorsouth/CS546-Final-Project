/*
*	Theodore Kluge
*/

const itemType = {
	_id: "string",
	name: "string",
	price: Number,
};
const sellerType = {
	_id: "string",
	name: "string",
	shopowner: Boolean,
};
const commentType = {
	_id: 'string',
	poster: sellerType,
	comment: 'string',
	rating: Number,
	timestamp: Date,
};
const purchaseType = {
	_id: 'string',
	item: itemType,
	purchasePrice: Number,
	timestamp: Date,
};

module.exports = {
	itemType,
	sellerType,
	commentType,
	purchaseType,
};
