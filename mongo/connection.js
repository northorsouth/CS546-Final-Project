const MongoClient = require("mongodb").MongoClient;
const Log = require('../common/Log');
const settings = require("../config");
const mongoConfig = settings.mongo;

const TAG = "Mongo.connection";

let fullMongoUrl = `${mongoConfig.serverUrl}`;
let _connection = undefined;
let _db = undefined;

module.exports = async () => {
	try {
		if (!_connection) {
			_connection = await MongoClient.connect(fullMongoUrl);
			_db = await _connection.db(mongoConfig.database);
		}
		return _db;
	} catch (e) {
		Log.e(TAG, e);
		process.exit(1);
	}
};

