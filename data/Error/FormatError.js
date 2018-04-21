/*
*	Theodore Kluge
*/

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
	toString() {
		if (this.typeObj)
			return this.msg + '\n' + JSON.stringify(this.typeObj, (key, val) => {
				if (typeof val === 'function') {
					return val.toString();
				} else {
					return val;
				}
			}, 2);
		return this.msg;
	}
}

module.exports = FormatError;
