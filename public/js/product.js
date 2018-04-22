'use strict';
(function() {
	const pElem = $('#cart-list');
	const starTemplate = template($('#star-template').innerHTML);
	const starInputTemplate = template($('#star-input-template').innerHTML);

	function fillItemDetails(res, xhr) {
		const item = JSON.parse(res);
		const averageRating = item.comments.length ? Array(Math.round((item.comments.reduce((a, c) => {
			return a + c.rating;
		}, 0)) / item.comments.length)).fill(starTemplate()).join('') : 'No ratings';
		$('#rating').innerHTML = averageRating;
	}

	function addInputStars() {
		for (let i = 1; i <= 5; i++) {
			if (i < 5) $('#star-rating').insertAdjacentHTML('beforeend', starInputTemplate({val: i}));
			else $('#star-rating').insertAdjacentHTML('beforeend', starInputTemplate({val: i, checked: 'checked'}));
		}
		$('#star-rating').addEventListener('click', function(e) {
			console.log(e.target)
		});
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

	addInputStars();

})();