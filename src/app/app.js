var options = {
	partials: {
		header: {
			selector: 'header',
			transclude: true,
			events: {
				search: 'form[name="searchFrm"]'
			}
		},
		stage: {
			selector: 'iframe',
			transclude: true,
			events: {
				prevImg: '.prev',
				nextImg: '.next'
			}
		},
		social: {
			selector: '#social-cont',
			transclude: true,
			events: {
				share: 'button[type="button"]',
			}
		},
		thumbnails: {
			selector: '#thumbs-cont',
			transclude: false,
			events: {
				// show: 'a'
			}
		},
		pagination: {
			selector: '#pagination-cont',
			transclude: true,
			events: {
				firstPage: '.first-page',
				prevPage: '.prev-page',
				nextPage: '.next-page',
				lastPage: '.last-page'
			}
		}
	},
	config: {
			perPage: 5,
			total: 200,
		dataSource: '#thumbs-cont',
		text: ''
	}
};

var app = new PhotoBrowser(options);