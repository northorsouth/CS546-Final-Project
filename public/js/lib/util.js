/*
*	Theodore Kluge
*/

// random utility functions

// $() to select elements
function $(sel, par) {
	if (!par) par = document;
	if (sel.startsWith('#')) return par.querySelector(sel);
	const els = par.querySelectorAll(sel);
	if (els.length > 1) return els;
	else return els[0];
}

// template
function template(str) {
	const regex = /(<%[=-]{0,1}\s*\w+\s*%>)/g;
	const matches = str.match(regex);
	if (matches) {
		return function(obj) {
			let str2 = str.trim();
			for (let i = 0; i < matches.length; i++) {
				const inner = matches[i].match(/\w+/);
				if (obj[inner])
					str2 = str2.replace(matches[i], obj[inner]);
				else
					str2 = str2.replace(matches[i], '');
			}
			return str2;
		}
	} else return function() {return str.trim()}
}
