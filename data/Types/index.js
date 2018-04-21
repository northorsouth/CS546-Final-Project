/*
*	Theodore Kluge
*/

const itemType = {
	_id: "string",
	name: "string",
	price: 'number',
};
const newItemType = {
	name: "string",
	price: 'number',
};
const sellerType = {
	_id: "string",
	name: "string",
	shopowner: 'boolean',
};
const commentType = {
	_id: 'string',
	poster: sellerType,
	comment: 'string',
	rating: 'number',
	timestamp: Date,
};
const newCommentType = {
	poster: sellerType,
	comment: 'string',
	rating: 'number',
	timestamp: Date,
};
const purchaseType = {
	_id: 'string',
	item: itemType,
	purchasePrice: 'number',
	timestamp: Date,
};

module.exports = {
	itemType,
	sellerType,
	commentType,
	purchaseType,
	newItemType,
	newCommentType,
};
