'use strict';
(function() {
	const plistElem = $('#cart-list');
	const productTemplate = template($('#cart-template').innerHTML);

	function fillProductList(user, xhr) {
		user = JSON.parse(user);
		const items = user.purchaseHistory;
		plistElem.innerHTML = '';
		for (const item of items) {
			const displayItem = {
				_id: item._id,
				name: item.item.name, 
				price: '$' + item.purchasePrice,
				time: new Date(item.timestamp).toDateString(),
				image: '/api/public/image/' + item.item._id
			};
			plistElem.insertAdjacentHTML('beforeend', productTemplate(displayItem));
		}

	}

	Ajax.get({
		url: '/api/user',
		success: fillProductList,
		error: function(res, xhr) {
			plist_elem.innerText = res;
		}
	});

})();