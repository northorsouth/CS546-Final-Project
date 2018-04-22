'use strict';
(function() {
	const pElem = $('#cart-list');
	const starTemplate = template($('#star-template').innerHTML);

	function fillItemDetails(res, xhr) {
		const item = JSON.parse(res);
		const averageRating = item.comments.length ? Array(Math.round((item.comments.reduce((a, c) => {
			return a + c.rating;
		}, 0)) / item.comments.length)).fill(starTemplate()).join('') : 'No ratings';
		$('#rating').innerHTML = averageRating;
	}

	const pid = location.href.split('/').reverse()[0];

	// haha ok sure
	Ajax.get({
		url: '/api/public/inventory/' + pid,
		success: fillItemDetails,
		error: function(res, xhr) {
			$('.error').innerText = res;
		}
	});

})();