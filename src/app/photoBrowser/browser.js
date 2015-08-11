(function(global) {

	'use strict';

	// private members
	var api = {
			base: {
				api_key: 'xxx-xxx-xxx',
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
			big: true,
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
	 
	   	@class
	   	@constructor
	   	@example new PhotoBrowser(options)
	   	@author HaRKoN

	 */
	var PhotoBrowser = function(options) {

		if (!options) {
			throw new ErrorHandler("Initialization Error", "Options cannot be empty");
		}

		this._el = document.querySelector(options.target);
		this._partials = options.partials;
		this._config = options.config || defaults;

		this._page = null;
		this._total = null;
		this._active = null;
		this._data = [];
		this._photos = [];

		try {

			this.init();
			this.load();

		} catch (e) {
			throw new ErrorHandler('Initialization Error', e);
		}

		return this;
	};

	PhotoBrowser.prototype = {
		//TODO
		cache: {},
		// init with options
		init: function() {
			var i = 0;
			// extend partials and bind configured events
			for (var p in this._partials) {
				if (this._partials.hasOwnProperty(p)) {
					var partial = this._partials[p],
						template;
					this._partials[p] = Utils.extend(partial, {
						id: i++,
						el: this._el.querySelector(partial.selector),
						name: p
					});
					this.bindEvents(partial);
				}
			}
			return this;
		},
		// bind events to controls defined in options
		bindEvents: function(partial) {

			if (!partial) throw new ErrorHandler("Bind Error", "A partial is required to bind events");
			for (var ev in partial.events) {
				if (partial.events.hasOwnProperty(ev) && iEvents[ev]) {
					var control = partial.el.querySelector(partial.events[ev]);
					if (!control) throw new ErrorHandler("Bind Error", "Cannot find selector");
					control.addEventListener(iEvents[ev].type, this.proxy(this[ev], this), false);
				}
			}
			return this;
		},
		// load data from API or DOM
		load: function(source) {
			var self = this,
				config = this._config;
			// if source not present default to dataSource option
			source = source || config.dataSource;
			// check if source is an array (JSON)
			if (source.constructor === Array) {
				// empty the data array
				this._data = [];
				// asign JSON array to data
				this._data = source;
			} else {
				// empty photos arrray
				this._photos = [];
				// get selector defined as source
				var container = this._el.querySelector(source),
					elements = container.getElementsByTagName('img');
				// loop through images and set photo model
				for (var i = 0; i < elements.length; i++) {
					// get href  
					var element = elements[i],
						data = {},
						parent = element.parentNode,
						href = parent.attributes.href.nodeValue;
					// get data attributes
					for (var attr in element.attributes) {
						if (element.attributes.hasOwnProperty(attr)) {
							var map = element.attributes[attr];
							var nameArr = map.name.split(/data-/);
							if (nameArr.length > 1) {
								data[nameArr[1]] = map.value;
							}
						}
					}
					// mix href with data  
					var model = Utils.extend({
						index: i,
						thumb: element,
						thumbUrl: element.attributes.src.nodeValue,
						imageUrl: href
					}, data);
					// push model to data array
					this._data.push(model);
				}
				this._total = this._data.length;
				this.paginate();
			}
			return this;
		},
		// paginate data based on limit defined in options
		paginate: function(data) {
			data = data || this._data;
			var pagination = this._partials.pagination.el,
				container = pagination.getElementsByTagName('ul')[0],
				limit = this._config.perPage,
				pages = Math.ceil(data.length / limit);
			// empty container
			container.innerHTML = '';
			for (var i = 0; i < pages; i++) {
				var listEl = document.createElement('li'),
					anchor = document.createElement('a');
				anchor.text = i + 1;
				anchor.setAttribute('data-page', i + 1);
				anchor.addEventListener('click', this.proxy(this.showPage));
				listEl.appendChild(anchor);
				container.appendChild(listEl);
			}
			//NOTE: has to be one. 
			this.render(1, data);
			return this;
		},
		// render paginated data
		render: function(page, data) {
			// this is the index for the one-based array used to move from page to page
			this._page = page;
			// return index to zero-base
			page = (page > 0 ? page : 1) - 1;
			// get passed in data or fallback to instance data
			data = data || this._data;
			var thumbsCont = this._partials.thumbnails.el,
				template = document.getElementById(this._partials.thumbnails.templateId),
				skip = this.getLimit(page),
				limit = this.getLimit(this._page),
				dataSlice = data.slice(skip, limit),
				self = this,
				count = 0;
			// exception handler
			if (!thumbsCont) throw new ErrorHandler("Render Error", "Could not find thumbs container");
			// empty thumbnails container
			thumbsCont.innerHTML = '';
			//empty photos array
			this._photos = [];

			for (var i = 0; i < dataSlice.length; i++) {
				// initialize Photo with data
				var obj = dataSlice[i],
					photo = new PhotoBrowser.Photo(obj);
				// load photo
				/* jshint loopfunc:true */
				photo.load('thumb', function(err, image) {
					// error handler
					if (err) throw new ErrorHandler("Image loading error", err);
					// add click event listener
					image.addEventListener('click', self.proxy(self.show));
					// get a copy of the image template and find target el
					var tmpl = template.content.cloneNode(true),
						imageCont = tmpl.querySelector('a');
					// append image to target and target to container
					imageCont.appendChild(image);
					thumbsCont.appendChild(tmpl);
					count++;
					// when done loading, show the first image of the fresh photos array
					if (dataSlice.length === count) {
						self.doShow(0);
					}
				});
				// push photo to photos array
				this._photos.push(photo);
			}
			return this;
		},
		// search data
		doSearch: function(text) {
			//TODO: Handle search from the API
			function equalsText(dataObj) {
				return dataObj.text === text;
			}
			var results;
			if (!text) {
				results = this._data;
			} else {
				results = this._data.filter(equalsText);
			} 
			this.paginate(results);

			return this;
		},
		doShow: function(index) {
			// NOTE: iframe an img are hard-coded here
			var frame = this._partials.stage.el.querySelector('iframe'),
				doc = frame.contentDocument || frame.contentWindow.document,
				img = doc.getElementsByTagName('img')[0],
				photo = this._photos[index],
				self = this;
			// load photo
			photo.load(function(err, image) {
				if (err) throw new ErrorHandler("Image loading error", err);
				doc.body.innerHTML = '';
				doc.body.appendChild(image);
				self._active = photo.index;

			});

			return this;
		},
		getPhotosLength: function() {
			return this._photos.length;
		},
		getIndex: function(index) {
			index = index || this._active;
			var found;
			this._photos.some(function(obj, i) {
				if (obj.index == index) {
					found = i;
					return true;
				}
			});
			return found;
		},
		getNext: function(base) {
			base = typeof base === 'number' ? base : this.getIndex();
			return base === this.getPhotosLength() - 1 ? 0 : base + 1;
		},
		getPrev: function(base) {
			base = typeof base === 'number' ? base : this.getIndex();
			return base === 0 ? this.getPhotosLength() - 1 : base - 1;
		},
		getPage: function() {
			return typeof this._page === 'number' ? this._page : false;
		},
		getPages: function() {
			return Math.ceil(this._total / this._config.perPage);
		},
		getLimit: function(page) {
			var perPage = this._config.perPage,
				skip = page * perPage,
				total = this._data.length;
			return (skip < total) ? skip : total;
		},
		getNextPage: function(base) {
			base = typeof base === 'number' ? base : this.getPage();
			return base === this.getPages() ? 1 : base + 1;
		},
		getPrevPage: function(base) {
			base = typeof base === 'number' ? base : this.getPage();
			return base === 1 ? this.getPages() : base - 1;
		},
		// Brings the scope into any callback
		proxy: function(fn, scope) {
			if (typeof fn !== 'function') {
				return function() {};
			}
			scope = scope || this;
			return function() {
				return fn.apply(scope, Utils.array(arguments));
			};
		},
		/**
			Mouse Event Handlers	
		*/
		// search event
		search: function(e) {
			// TODO: Dynamicaly find selector
			e.preventDefault();
			var form = this._el.querySelector('#search');
			this.doSearch(form.text.value);
			form.reset();
		},
		// previous event
		prevImg: Utils.debounce(function(e) {

			e.preventDefault();
			if (this.getPhotosLength() > 1) {
				this.doShow(this.getPrev());
			}
			return;
		}, 200),
		// next event
		nextImg: Utils.debounce(function(e) {

			e.preventDefault();
			if (this.getPhotosLength() > 1) {
				this.doShow(this.getNext());
			}
			return;
		}, 200),
		// show event
		show: Utils.debounce(function(e) {

			e.stopPropagation();
			var idx = this.getIndex(e.target.getAttribute('data-index'));
			this.doShow(idx);
			return;
		}, 200),
		// share event
		share: Utils.debounce(function(e) {
			e.preventDefault();
			return;
		}, 200),
		// go to first page
		firstPage: Utils.debounce(function(e) {

			e.stopPropagation();
			this.render(1);
			return;
		}, 200),
		// go to previous page
		prevPage: Utils.debounce(function(e) {

			e.stopPropagation();
			if (this.getPages() > 1) {
				this.render(this.getPrevPage());
			}
			return;
		}, 200),
		showPage: Utils.debounce(function(e) {
			e.preventDefault();
			e.stopPropagation();
			var page = parseInt(e.target.getAttribute('data-page'));
			if (this.getPages() > 1) {
				this.render(page);
			}
			return;
		}, 200),
		// go to next page
		nextPage: Utils.debounce(function(e) {

			e.preventDefault();
			if (this.getPages() > 1) {
				this.render(this.getNextPage());
			}
			return;
		}, 200),
		// go to last page
		lastPage: Utils.debounce(function(e) {

			e.stopPropagation();
			var last = this.getPages();
			this.render(last);
			return;
		}, 200)
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