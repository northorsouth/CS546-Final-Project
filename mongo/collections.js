const dbconn = require("./connection");
const Log = require('../common/Log');

const TAG = "Mongo.collection";
const getCollection = collection => {
	let _col = undefined;
	return async () => {
		try {
			if (!_col) {
				const db = await dbconn();
				_col = await db.collection(collection);
			}
			return _col;
		} catch (e) {
			Log.e(TAG, e);
		}
	};
};

module.exports = {
	inventory: getCollection("inventory"),
	users: getCollection("users"),
};
