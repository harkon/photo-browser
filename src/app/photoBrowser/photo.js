(function(global) {

	'use strict';

	var Photo = function(data) {

		if (!data) {
			throw new PhotoBrowser.errorHandler("Photo Init", "Data are required");
		}
		//BUG

		// if (!data.index) {
		// 	throw new PhotoBrowser.errorHandler("Photo Init", "Index is required for photo");
		// }

		// base property for all
		this.index = data.index;
		this.source = data.source;

		// // properties for data from flickr API
		this._id = data.id;
		this._farm = data.farm;
		this._owner = data.owner;
		this._server = data.server;
		this._secret = data.secret;

		// propetries for data parsed from DOM
		this.image = data.image || null;
		this.imageUrl = data.imageUrl || null;
		this.thumb = data.thumb || null;
		this.thumbUrl = data.thumbUrl || null;
		this.credits = data.credits || null;
		this.text = data.text || null;



		// we assume that both imageUrl and thumbUrl will be set if data source is the DOM
		// so we set the urls to the APIs url without the '_' sign and the file extension 
		if (!this.thumbUrl || !this.imageUrl) {
			this.thumbUrl = this.getHostname() + '/' + this.getFilename();
			this.imageUrl = this.getHostname() + '/' + this.getFilename();
		}

		return this;
	};

	Photo.prototype = Object.create(PhotoBrowser.prototype);

	Photo.prototype.cache = {};

	Photo.prototype.load = function(size, callback) {

		if (!size) {
			throw new PhotoBrowser.errorHandler("Load photo", "You must specify an image size");
		}
		// NOTE:check cache before you try loading 
		console.log(this)


		var self = this;

		//shorten arguments
		// if (typeof size == 'function') {
		// 	callback = size;
		// 	size = null; // must fallback to a default
		// }


		// this.image = new Image();

		// this.image.addEventListener('load', function() {

		// 	self.cache[src] = src; // will override old cache
		// 	callback.call(self, self);

		// });

		// // start loading
		// this.image.src = src;
	};

	Photo.prototype.show = function(e) {

		e.preventDefault();
		e.stopPropagation();

		this.load(function() {
			this._browser.show(this.index);
		});
	};

	Photo.prototype.clear = function() {
		this.image = null;
		this.thumb = null;
	};

	Photo.prototype.getHostname = function() {
		return "http://farm" + this._farm + ".static.flickr.com";
	};

	Photo.getFilename = function(size) {
		return this._server + "/" + this._id + "_" + this._secret + '_' + size + '.jpg';
	};

	// expose to global
	global.Photo = Photo;

})(window);