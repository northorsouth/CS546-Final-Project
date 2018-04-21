/*
*	Theodore Kluge
*/

function typesMatch(types, obj) {
	if (typeof types !== 'object') return false;
	if (typeof obj !== 'object') return false;
	if (Object.keys(types).length !== Object.keys(obj).length) return false;

	for (const key in types) {
		if (!obj[key]) return false;
		if (types[key] === 'string') {
			if (typeof obj[key] !== 'string') return false;
		} else if (types[key] === 'boolean') {
			if (typeof obj[key] !== 'boolean') return false;
		} else {
			if (typeof types[key] === 'function') {
				// a Class
				if (!(obj[key] instanceof types[key])) return false;
			} else {
				// a nested object
				return typesMatch(types[key], obj[key]);			
			}
		}
	}
	return true;
}

module.exports = typesMatch;
