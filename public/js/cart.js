'use strict';
(function() {
	const plistElem = $('#cart-list');
	const productTemplate = template($('#cart-template').innerHTML);

	function fillProductList(user, xhr) {
		const items = JSON.parse(user).cart;
		plistElem.innerHTML = '';
		for (const item of items) {

			const displayItem = {
				_id: item._id,
				name: item.name, 
				price: '$' + item.price,
				image: '/api/public/image/' + item._id
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

	document.addEventListener('click', function(e) {
		e.preventDefault();
		const el = e.target;
		if (!el.classList.contains('btn-remove')) return;
		const id = el.getAttribute('data-click');
		Ajax.delete({
			url: '/api/cart/' + id,
			success: function(res, xhr) {
				$('.product-preview#' + id).delete();
			},
			error: function(res, xhr) {
				$('.error').innerText = res;
			}
		});
	})

})();