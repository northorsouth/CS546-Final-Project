'use strict';
(function() {
	const plistElem = $('#product-list');
	const productTemplate = template($('#product-template').innerHTML);
	const starTemplate = template($('#star-template').innerHTML);

	function fillProductList(items, xhr) {
		items = JSON.parse(items);
		plistElem.innerHTML = '';
		for (const item of items) {

			if (!item.count) continue;

			const averageRating = item.comments.length ? Array(Math.round((item.comments.reduce((a, c) => {
				return a + c.rating;
			}, 0)) / item.comments.length)).fill(starTemplate()).join('') : 'No ratings';

			const displayItem = {
				_id: item._id,
				name: item.item.name, 
				price: '$' + item.item.price,
				image: '/api/public/image/' + item._id,
				stars: averageRating
			};
			plistElem.insertAdjacentHTML('beforeend', productTemplate(displayItem));
		}
	}

	Ajax.get({
		url: '/api/public/inventory',
		success: fillProductList,
		error: function(res, xhr) {
			plist_elem.innerText = res;
		}
	});

})();