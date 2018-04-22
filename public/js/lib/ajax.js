/*
*	Theodore Kluge
* 	Christopher Drew, Dakota Crouchelli
*/

// Ajax helper object with convenient methods

var Ajax = {
	get: function(opts) {
		if (!opts) opts = {};
		opts.method = 'get';
		return Ajax.ajax(opts);
	},
	post: function(opts) {
		if (!opts) opts = {};
		opts.method = 'post';
		return Ajax.ajax(opts);
	},
	put: function(opts) {
		if (!opts) opts = {};
		opts.method = 'put';
		return Ajax.ajax(opts);
	},
	patch: function(opts) {
		if (!opts) opts = {};
		opts.method = 'patch';
		return Ajax.ajax(opts);
	},
	delete: function(opts) {
		if (!opts) opts = {};
		opts.method = 'delete';
		return Ajax.ajax(opts);
	},
	head: function(opts) {
		if (!opts) opts = {};
		opts.method = 'head';
		return Ajax.ajax(opts);
	},
	options: function(opts) {
		if (!opts) opts = {};
		opts.method = 'options';
		return Ajax.ajax(opts);
	},
	ajax: function(opts) {
		if (!opts) throw 'Missing required options parameter.';
		if (opts.method) {
			if (!['get', 'post', 'put', 'patch', 'delete', 'head', 'options'].includes(opts.method.toLowerCase())) throw 'opts.method must be one of: GET, POST, PUT, PATCH, DELETE, HEAD, OPTIONS.';
			opts.method = opts.method.toUpperCase();
		}

		var xhr = opts.xhr || new XMLHttpRequest();

		var fd = null;
		var qs = '';
		if (opts.data && opts.method.toLowerCase() != 'get') {
			fd = new FormData();
			for (let key in opts.data) fd.append(key, opts.data[key]);
		} else if (opts.data) {
			qs += '?';
			let params = [];
			for (let key in opts.data) {
				params.push([key, opts.data[key]].join('='));
			}
			qs += params.join('&');
		}

		xhr.onload = () => {
			if (xhr.status !== 200) return xhr.onerror();
			var data = xhr.response;
			if (opts.success) opts.success(data, xhr);
		}
		xhr.onerror = () => {
			var data = xhr.response;

			// method not allowed
			if (xhr.status === 405) {
				if (opts.error) opts.error(data, xhr);
				return;
			}

			try {
				if (opts.error) opts.error(data, xhr);
			} catch (e) {
				opts.error(data, xhr);
			}
		}
		xhr.open(opts.method || 'GET', opts.url + qs || location.href);

		if (opts.headers) {
			for (let key in opts.headers) xhr.setRequestHeader(key, opts.headers[key]);
		}

		//xhr.setRequestHeader('Content-Type', 'application/json')
		
		xhr.send(fd);
	}
}

window.Ajax = Ajax;

