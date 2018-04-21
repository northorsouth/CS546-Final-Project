class FormatError extends Error {
	constructor(msg, typeObj) {
		super(msg);
		this.msg = msg;
		this.typeObj = typeObj;
	}
	toJSON() {
		return {
			status: 400,
			error: this.msg,
			type: this.typeObj ? this.typeObj : undefined,
		};
	}
}

module.exports = FormatError;
