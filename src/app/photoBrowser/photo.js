(function(global) {

	'use strict';

	PhotoBrowser.Photo = function(data) {

		if (!data) {
			throw new PhotoBrowser.errorHandler("Photo Init", "Data are required");
		}

		// base property for all
		this.index = data.index;

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
		// so we set the urls to the API url
		// TODO: Handle image size dynamicaly
		if (!this.thumbUrl || !this.imageUrl) {
			this.thumbUrl = this.getHostname() + '/' + this.getFilename('q');
			this.imageUrl = this.getHostname() + '/' + this.getFilename('c');
		}

		return this;
	};

	PhotoBrowser.Photo.prototype = Object.create(PhotoBrowser.prototype);

	PhotoBrowser.Photo.prototype.cache = {};

	PhotoBrowser.Photo.prototype.load = function(type, callback) {

		// TODO:check cache before try loading, preload

		if (!type) {
			throw new PhotoBrowser.errorHandler("Load photo", "You must specify an image type");
		}

		var image = new Image(),
			src = (type === 'thumb') ? this.thumbUrl : this.imageUrl,
			self = this;

		// shorten the arguments
		if (typeof type === 'function') {
			callback = type;
			type = null;
		}

		// set some event handlers
		image.onerror = function() {
			this.onerror = this.onload = null;
			callback.call(self, this);
		};

		image.onload = function() {
			this.onerror = this.onload = null;
			this.setAttribute('data-index', self.index);
			callback.call(self, null, this);
		};

		// start loading
		image.src = src;

		return this;
	};

	PhotoBrowser.Photo.prototype.getHostname = function() {
		return "http://farm" + this._farm + ".static.flickr.com";
	};

	PhotoBrowser.Photo.getFilename = function(size) {
		return this._server + "/" + this._id + "_" + this._secret + '_' + size + '.jpg';
	};

	// expose to global
	global.Photo = PhotoBrowser.Photo;

})(window);