class Log {
	static d(tag, msg) {
		if (!msg) {
			msg = tag;
			tag = 'NoTag';
		}
		console.log(`[${(new Date()).toISOString()}] D/${tag}: ${msg.toString()}`);
	}
	static w(tag, msg) {
		if (!msg) {
			msg = tag;
			tag = 'NoTag';
		}
		console.warn(`[${(new Date()).toISOString()}] W/${tag}: ${msg.toString()}`);
	}
	static e(tag, msg) {
		if (!msg) {
			msg = tag;
			tag = 'NoTag';
		}
		console.error(`[${(new Date()).toISOString()}] E/${tag}: ${msg.toString()}`);
	}
}

module.exports = Log;
