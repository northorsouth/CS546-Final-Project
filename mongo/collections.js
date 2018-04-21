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

const clearAll = async () => {
	try {
		Log.d(TAG, 'clearing all data');
		const db = await dbconn();
		let a = await getCollection('inventory')();
		await a.remove({});
		a = await getCollection('users')();
		await a.remove({});
	} catch (e) {
		Log.e(TAG, e);
	}
}

module.exports = {
	inventory: getCollection("inventory"),
	users: getCollection("users"),
	clearAll,
};
