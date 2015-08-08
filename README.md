Responsive Flickr Image Browser

NOTE: This is a work in progress and it's not finished yet.

BUILD REQUIREMENTS

1. npm
2. gulp
To run this project you will need the npm package manager and gulp builder.

FEATURES
1.	Search
2.	Pagination
3.	Multiple data sources
4.	Totally configurable by passing options, during initialization.
5.	Support of different templates for each instance, even on the same page.

OVERVIEW 

This is reusable library designed with all best practices in mind (accessibility, performance, 
progressive enhancement). This widget can work with or without having JavaScript enabled on 
the browser and can be instantiated more than one time on the same page.

The widget comes with two HTML files. The main which is also the widgets template in plain 
HTML  and a second that it's used when there's no JavaScript enabled on the browser and it 
gets called by an <iframe> tag which is wrapped into a <nocode> tag in the main template. 
This way we still support UX for the user.  Since we re talking to the Flickr API, we have made 
the assumption that this widget is going to be running over PHP pages that communicate with 
the API. ( This is not implemented on the markup).

 For the implementation of this widget we used jQuery, cause it is massively supported by the 
majority of the most popular CMS. We don't use it heavily on this project and the intention is 
to remove it in the future.

The widget provides a main photo container which contains an image in large dimensions and 
a thumbnails container that keeps all the thumbnails of the images available in the widget. 
You can navigate forth and back through the available images from the two arrow buttons on 
top of the main image container. The navigation loops over when you reach the end of the 
available images. 

Large images besides the first one in the response, are not loaded on startup for better 
performance. 

The widget is also searchable. There is a form control over the main container that you can use 
to query the API and get the appropriate image. 

If the response is more than the defined limit in the widgets options a pagination control 
shows the available pages on the requested search term.

Finally we can load images into the widget data array in two ways. Either by a call to the API 
(REST Json), or by providing an HTMLElement as it's data source. This can be configured on the 
options available on the app.js. (config -> dataSource)

Some other options you can setup during the initialization process are:

1. 	We consider each section of the widget as an independent partial that you can setup it's 
	template and events through options passed on it.
2. Templates - You can describe the template used for each section. Available options are:
	*	target:  the target element 
	*	template:  the template to render on the target (HTML)
	*	transclude:  this defines if we'll replace the target's HTML or we ll just append 
		something to it
	*	events:  this is an object where we pass the supported event and the selector to bind it 
		on.

SUPPORTED EVENTS

	*	firstPage					
	*	prevPage					
	*	nextPage					
	*	lastPage
	*	prevImg
	*	nextImg
	*	search
USAGE EXAMPLE

	form: {
		target: 'header',
		template: $('#form-tmpl').html(),
		transclude: true,
		events: {
			search: 'form[name="searchFrm"]'
		}
	}

