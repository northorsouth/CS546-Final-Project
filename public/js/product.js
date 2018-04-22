'use strict';
(function() {
	const pElem = $('#cart-list');
	
	function fillItemDetails(res, xhr) {

	}

	Ajax.get({
		url: '/api/inventory/' + window.productId,
		success: fillItemDetails,
		error: function(res, xhr) {
			$('.error').innerText = res;
		}
	});

})();