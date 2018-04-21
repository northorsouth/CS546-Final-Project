class DatabaseError extends Error {
	constructor(status, msg) {
		super(msg);
		this.status = status;
		this.msg = msg;
	}
	toJSON() {
		return {
			status: this.status,
			error: this.msg
		};
	}
}

module.exports = DatabaseError;
