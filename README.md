# angular-prerender

## About: 
Prerender your angular project to improve SEO and make pretty links.

## Install: 
- Fork repository
- Change to angular-prerender directory
- Run 'npm install'

## Setup:
- In your main directory create a file named prerender-config.json
- Add a default route and all the other routes to your file. Like below:
```
{
	"template": "index.html",
	"templateView": "app/views/home.html",
	"templateController": "HomeCtrl",
	"routes": [
		{
		  "name": "about",
		  "title": "About",
		  "descritpion": "About",
		  "controller": "AboutCtrl",
		  "view": "app/views/about.html",
		  "scripts": [
		    "app/js/home.js"
		  ],
		  "styles": [
		  ]
		},
		{
		  "name": "budget",
		  "title": "Budgeting Guide",
		  "descritpion": "article about budgeting",
		  "author": "Jeremy",
		  "controller": "BudgetCtrl",
		  "view": "app/js/budget/view.html",
		  "scripts": [
		    "app/js/budget/budget.js"
		  ],
		  "styles": [
		  ]
		}
	]
}
```
- In your index.html file or which ever file will be your template you will need to add some scripts and tags.
- Below your css files add
```
<!-- prerender-styles -->
<!-- prerender-style-end -->
```
- Below your js files add
```
<!-- prerender-styles -->
<!-- prerender-style-end -->
```

## Prerender pages
- Run from the directory with prerender-config.json
```
$ node prerender/prerender
```

## Improvments
- Make it work for nested directories
- Make it work for url parameters.
- Let the coder be able to decide what route template to use in agnular-prerender-routes.js
- explain url href issue in menu.js and work arrounds.
- for each route file it creates, only need to add the route info for that route.