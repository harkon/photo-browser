# Responsive Photo Browser

## Build and Development

Run `gulp` for building and `gulp serve` for preview.

## FEATURES

* Multi data sources (DOM or API)
* Multi instances in the same page
* Multi HTML templates with diffent styles, even on the same page
* Totally configurable through init options
* HTML fallback if javascript is dibaled
* Searchable results
* Pageable results
* Caching - TODO

## OVERVIEW 

This is reusable library designed with all best practices in mind (accessibility, performance, 
progressive enhancement). This widget can work with or without having JavaScript enabled on 
the browser and can be instantiated more than one time on the same page, with different styles
and/or templates

The widget comes with two HTML files. The main which also keeps the widgets template and a second that it's used to display the large selected image.

For the implementation of this widget I have focused on the performance and I have followed all best practises like progressive enchanment for devices. I didn't use any libraries. It's pure HTML5, CSS3 and Javascript.

## NOTE

Styling is not done