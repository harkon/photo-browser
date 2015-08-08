(function(global) {

	'use strict';

	// private members
	var api = {
			base: {
				api_key: 'cee923fa7a591fbe5e464a4d7b9cd500',
				url: 'https://api.flickr.com/services/rest/',
				format: 'json',
				per_page: 20,
				nojsoncallback: 1,
			},
			info: {
				method: 'flickr.photos.getInfo',
				photo_id: 'flickr.photos.search'
			},
			search: {
				method: 'flickr.photos.search',
				text: 'mykonos'
			}
		},
		// default settings
		defaults = {
			page: 1,
			perPage: 5,
			total: 200,
			dataSource: '',
			text: ''
		},
		// internal supported events
		iEvents = {
			search: {
				type: 'submit'
			},
			prevImg: {
				type: 'click'
			},
			nextImg: {
				type: 'click'
			},
			share: {
				type: 'click'
			},
			showImg: {
				type: 'click'
			},
			firstPage: {
				type: 'click'
			},
			prevPage: {
				type: 'click'
			},
			nextPage: {
				type: 'click'
			},
			lastPage: {
				type: 'click'
			}
		},
		// internal supported image sizes
		iSizes = {
			small: 's', //square 75x75
			large: 'q', //square 150x150
			thumbnail: 't', //100 on longest side
			small240: 'm', //240 on longest side
			small320: 'n', //320 on longest side
			medium500: '-', //500 on longest side
			medium640: 'z', //640 on longest side
			medium800: 'c', //800 on longest side†
			large1024: 'b', //1024 on longest side*
			large1600: 'h', //1600 on longest side†
			large2048: 'k', //2048 on longest side†
			original: 'o' //original
		},
		// faking error handling
		ErrorHandler = function(name, message) {
			// exception object
			this.name = name;
			this.message = message;

			return this.name + ': ' + this.message;
		},
		// utility functions
		Utils = (function() {

			return {
				// Extend a given object with all the properties in passed-in object(s).
				// based on underscore implementation
				extend: function(defaults) {
					var obj = arguments[0];
					var length = arguments.length;
					if (defaults) obj = Object(obj);
					if (length < 2 || obj === null) return obj;
					for (var index = 1; index < length; index++) {
						var source = arguments[index],
							keys = Object.keys(source),
							l = keys.length;
						for (var i = 0; i < l; i++) {
							var key = keys[i];
							if (!defaults || obj[key] === void 0) obj[key] = source[key];
						}
					}
					return obj;

				},
				// Convert arguments object to a real array
				array: function(obj) {
					return Object.keys(obj).map(function(key) {
						return obj[key];
					});
				},
				// parse anything into a number
				parseValue: function(val) {
					if (typeof val === 'number') {
						return val;
					} else if (typeof val === 'string') {
						var arr = val.match(/\-?\d|\./g);
						return arr && arr.constructor === Array ? arr.join('') * 1 : 0;
					} else {
						return 0;
					}
				},
				debounce: function(func, wait, immediate) {
					var timeout;
					return function() {
						var context = this,
							args = arguments;
						var later = function() {
							timeout = null;
							if (!immediate) func.apply(context, args);
						};
						var callNow = immediate && !timeout;
						clearTimeout(timeout);
						timeout = setTimeout(later, wait);
						if (callNow) func.apply(context, args);
					};
				},
				// timestamp abstraction
				timestamp: function() {
					return Date.now();
				},
				// Make an Ajax call to any url and get back a promise
				get: function(url, data) {
					// return $.ajax({
					// 	url: url,
					// 	data: data
					// });
				}
			};
		})();

	/**
	 	The main PhotoBrowser class returns a new instance of the PhotoBrowser init function. 
 		This is an immetation of the jQuery class initialization process and we use it,so we don't 
 		have to use the new keyword every time we need a new instance of the class. 
	 
	   	@class
	   	@constructor
	   	@example $FB(target, partials, options) or PhotoBrowser (target, selectors, options)
	   	@author HaRKoN
	   	@requires jQuery

	 */
	var PhotoBrowser = function(options) {

		if (!options) {
			throw new ErrorHandler("Initialization Error", "Options cannot be empty");
		}

		this._partials = options.partials;
		this._config = options.config || defaults;

		this._page = null;
		this._active = null;
		this._data = [];
		this._photos = [];

		try {

			this.init();
			this.load();

		} catch (e) {
			//TODO: Error Handler
			console.error(e);
		}

		console.log(this);

		return this;
	};

	PhotoBrowser.prototype = {

		cache: {},

		/**
			Get the partials as set during init, enhance them with an id and a name
			and finally bind any events assigned to them 

	        @returns Instance
	    */
		init: function() {

			var i = 0;

			// extend partials and bind configured events
			for (var tmpl in this._partials) {

				if (this._partials.hasOwnProperty(tmpl)) {

					var partial = this._partials[tmpl];
					partial.selector = document.querySelector(partial.selector);

					Utils.extend(partial, {
						id: i++,
						name: tmpl
					});

					this.bindEvents(partial);

				}
			}

			return this;
		},

		/**
			Get any events defined on the partial, check if it's supported it and 
			if it is bind it on the partial

	        @param {Object} [partial] Required

	        @returns Instance
	    */
		bindEvents: function(partial) {

			if (!partial) {
				throw new ErrorHandler("Bind Error", "A partial is required to bind events");
			}

			for (var ev in partial.events) {
				if (partial.events.hasOwnProperty(ev) && iEvents[ev]) {
					var control = document.querySelector(partial.events[ev]);
					console.log(control);
					if (!control) {
						throw new ErrorHandler("Bind Error", "Cannot find selector");
					}
					control.addEventListener(iEvents[ev].type, this.proxy(this[ev], this));
				}
			}

			return this;
		},

		/**
	        Loads data into PhotoBrowser. 
	        You can load data either as JSON array or by parsing a DOM element. 
			
	        @param {Array|string} [source] Optional JSON array of data or selector of where to find data in the document.
	        Defaults to dataSource option.

	        @returns Instance
	    */
		load: function(source) {

			var self = this,
				config = this._config;

			// if source not present default to dataSource option
			source = source || config.dataSource;

			// check if source is an array (JSON)
			if (source.constructor === Array) {

				// empty the data array
				this._data = [];

				this._data = source;

			} else {

				// empty photos arrray
				this._photos = [];

				// get selector defined as source
				var container = document.querySelector(source),
					elements = container.getElementsByTagName('img');

				// loop through images and set photo model
				for (var i = 0; i < elements.length; i++) {
					// get href  
					var element = elements[i],
						data = {},
						parent = element.parentNode,
						href = parent.attributes.href.nodeValue;

					// remove progressive enhancement attributes 
					// to take absolute control of image loading
					// NOTE: anchor element without href attribute is safe in HTML5
					parent.removeAttribute('href');
					parent.removeAttribute('target');

					// get the data attributes
					for (var prop in element.attributes) {
						if (element.attributes.hasOwnProperty(prop)) {
							/* jshint loopfunc:true */
							Utils.array(element.attributes).reduce(function(a, b) {
								var attrs = b.name.split(/data-/);
								if (attrs.length > 1) {
									data[attrs[1]] = b.value;
								}
							}, data);
						}
					}

					// add click event listener to element
					element.addEventListener('click', Utils.debounce(this.proxy(this.show), 200));

					// add data-index attribute to element
					element.setAttribute('data-index', i);

					// mix href with data and push it into 
					var model = Utils.extend({
						index: i,
						thumb: element,
						thumbUrl: element.attributes.src.nodeValue,
						imageUrl: href
					}, data);

					// initialize new Photo 
					var photo = new Photo(model);

					// push photo to data array
					this._photos.push(photo);

				}

				// we assume that the current displayed image on stage is the 1st index
				this._active = 0;

			}

			return this;
		},

		render: function(page) {

			page = (page > 0 ? page : 1) - 1;

			//NOTE: If data source is the DOM, limit must be the number of elements on the template
			var config = this._config,
				data = this._data,
				thumbsCont = this._partials.thumbnails.selector,
				paginationCont = this._partials.pagination.selector,
				limit = config.perPage,
				skip = page * limit;

			if (!thumbsCont) {
				throw new ErrorHandler("Render Error", "Could not find thumbs container");
			}

			if (!paginationCont) {
				throw new ErrorHandler("Render Error", "Could not find pagination container");
			}

			//empty photos array
			this._photos = [];

			for (var i = skip; i < limit; i++) {



				// if (photo.thumb) {
				// 	//thumb is already loaded, bind click event
				// 	console.log(photo.thumb.parentNode);

				// } else {
				// 	// thumb is not loaded, load thumbs with size into thumbs container partial


				// }

				// // console.log();
				// this._photos.push(photo);

				// if (source === 'json') {
				// 	this.load('thumb', fromApi);
				// } else {
				// 	//TODO
				// }

			}

			// show the first image
			// this.show(0);

			return this;
		},


		doSearch: function(options) {

			//TODO: Handle search from the API
			function equalsText(data) {
				return data.text === options.text;
			}

			/*
				UNCOMMENT TO TEST WITH THE dom

			//NOTE: We don't clear the data array since 
			//we 're not actually talking to an API to retrive data

			var results = this._photos.filter(equalsText),
			view = this._views.thumbs.target;

			view.$el.empty();

			for (var i = 0; i < results.length; i++) {
				view.$el.append(results[i].thumb.$el);
			}

			return this;
			*/

			/* 
				UNCOMMENT TO TEST WITH THE API
			*/
			var self = this,
				data = $.extend(api.base, api.search, options);

			Utils.get(data.url, data)
				.done(function(resp) {
					if (resp.stat !== 'ok') return;
					self._page = resp.page;
					self.load(resp.photos.photo);
					self.create();

					return self;
				})
				.fail(function(err) {
					//TODO: Error handling
					console.error(err);
					return;
				});

		},

		doShow: function(index) {

			var doc = this._partials.stage.selector.contentDocument ||
				this._partials.stage.selector.contentWindow.document;

			var photo = this._photos[index];
			photo.load();
			// console.log(photo);



			return this;

		},

		getActiveImage: function() {
			return this._active || false;
		},

		getIndex: function() {
			return typeof this._active.index === 'number' ? this._active.index : false;
		},

		getData: function(index) {
			return index in this._data ?
				this._data[index] : this._data[this._active];
		},

		getPhotosLength: function() {
			return this._photos.length;
		},

		getNext: function(base) {
			base = typeof base === 'number' ? base : this.getIndex();
			return base === this.getPhotosLength() - 1 ? 0 : base + 1;
		},

		getPrev: function(base) {
			base = typeof base === 'number' ? base : this.getIndex();
			return base === 0 ? this.getPhotosLength() - 1 : base - 1;
		},

		/**
			Mouse Event Handlers	

		*/
		search: function(e) {

			e.preventDefault();

			var data = $(e.currentTarget)
				.serialize()
				.split('=');

			var params = {};

			params[data[0]] = data[1];

			console.log(params);

			this.doSearch(params);

			$(e.currentTarget).find('input[type="text"]').val('');
		},

		prevImg: function(e) {
			e.preventDefault();
			if (this.getPhotosLength() > 1) {
				this.doShow(this.getPrev(), true);
			}
			return this;
		},

		nextImg: function(e) {
			console.log(e);
			// if (this.getPhotosLength() > 1) {
			// 	console.log(this.getNext())
			// 	this.show(this.getNext(), false);
			// }
			// return this;
		},
		// the thumbnail click handler
		show: function(e) {
			e.stopPropagation();
			var index = e.target.getAttribute('data-index');

			if (this.getPhotosLength() > 1) {
				this.doShow(index);
			}

			return this;

		},
		share: function(e) {
			e.preventDefault();
			console.log("share");

			return this;
		},
		firstPage: function(e) {
			e.preventDefault();
			console.log("firstPage");
		},
		prevPage: function(e) {
			e.preventDefault();
			console.log("prevPage");
		},
		nextPage: function(e) {
			e.preventDefault();
			console.log("nextPage");
		},
		lastPage: function(e) {
			e.preventDefault();
			console.log("lastPage");
		},
		/**
	        Brings the scope into any callback

	        @param fn The callback to bring the scope into
	        @param [scope] Optional scope to bring

	        @example $('#search').click( this.proxy(function() { this.search(); }) )

	        @returns {Function} Return the callback with the browser scope
	    */
		proxy: function(fn, scope) {
			if (typeof fn !== 'function') {
				return function() {};
			}
			scope = scope || this;
			return function() {
				return fn.apply(scope, Utils.array(arguments));
			};
		}
	};

	/**
		Static methods
	*/

	PhotoBrowser.defaults = defaults;

	PhotoBrowser.sizes = iSizes;

	PhotoBrowser.utils = Utils;

	PhotoBrowser.errorHandler = ErrorHandler;

	// expose to global
	global.PhotoBrowser = PhotoBrowser;

})(window);