var options = {
	target: '.wrapper',
	partials: {
		header: {
			selector: '#header',
			events: {
				search: '#search'
			}
		},
		stage: {
			selector: '#stage',
			events: {
				prevImg: '.prev',
				nextImg: '.next'
			}
		},
		social: {
			selector: '#social',
			events: {
				share: 'button[type="button"]',
			}
		},
		thumbnails: {
			selector: '#thumbnails',
			templateId: 'thumb-tmpl', // this must be an id attribute on a template element
			events: {
				// show: 'a'
			}
		},
		pagination: {
			selector: '#pagination',
			events: {
				firstPage: '.first-page',
				prevPage: '.prev-page',
				nextPage: '.next-page',
				lastPage: '.last-page'
			}
		}
	},
	config: {
		perPage: 6,
		dataSource: '#thumbnails',
		text: ''
	}
};

var app = new PhotoBrowser(options);