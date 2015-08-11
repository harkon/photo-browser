Responsive Photo Browser

BUILD REQUIREMENTS

1. npm
2. gulp
To run this project you will need the npm package manager and gulp builder.

FEATURES
1. Multi data sources (DOM and API)
2. Multi instances in the same page
3. Multi HTML templates with diffent styles, even on the same page
4. Totally configurable through init options
5. HTML fallback if javascript is dibaled
6. Searchable results
7. Pageable results
8. Cache - TODO

OVERVIEW 

This is reusable library designed with all best practices in mind (accessibility, performance, 
progressive enhancement). This widget can work with or without having JavaScript enabled on 
the browser and can be instantiated more than one time on the same page, with different styles
and/or templates

The widget comes with two HTML files. The main which also keeps the widgets template and a second that it's used to display the large selected image.

For the implementation of this widget we didn't use any libraries. It's pure HTML5, CSS3 and Javascript.

Having performance in mind I decided to use to arrays to handle the images and the data. Those are also 
the names of the arrays. The data array keeps all data concerning the image to be loaded ex. text, src etc
and the photos array is an array that keeps the actual image objects and it gets empty every time we 
render a view. We re doing this so the references of the created photo objects leave the memory and 
so they get GC-ed. 

The next - previous functions on both photos and pages (data) arrays are implemented not by using object 
references but by using the array indeces of the objects.

Finally for the CSS we used the LESS compiler. 