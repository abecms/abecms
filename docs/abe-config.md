# Abe config

> create a file abe.json at the root of your abe project


```json
{
	"localeFolder": "locale",
	"intlData": {
		"locales": "en-US"
	},
	"upload": {
		"image": "image",
		"fileSizelimit": 10485760
	},
	"csp": {
		"scriptSrc": [],
		"styleSrc": [],
		"imgSrc": [],
		"childSrc": [],
		"frameAncestors": [],
		"mediaSrc": [],
		"fontSrc": [],
		"connectSrc": []
	},
	"security": true,
	"htmlWhiteList": {
		"blockquote": ["style"],
		"span": ["style"],
		"font": ["style", "color"],
		"div": ["style"],
		"sup": ["style"],
		"sub": ["style"],
		"ul": ["style"],
		"li": ["style"],
		"p": ["style"],
		"b": ["style"],
		"strong": ["style"],
		"i": ["style"],
		"u": ["style"],
		"a": ["style", "href"],
		"br": [],
		"h1": ["style"],
		"h2": ["style"],
		"h3": ["style"],
		"h4": ["style"]
	},
	"files": {
		"templates": {
			"extension": "html",
			"assets": "_files"
		}
	},
	"cookie": {
		"secure": false
	},
	"siteUrl": false,
	"sitePort": false
}
```

> LocalFolder

to change locale

> Upload

Asset upload into the backoffice

> csp / security

Enable/disable security + config

> htmlWhiteList

Wysiwyg configuration

> files

file extension + [ folder ]_files assets

> cookie

Enable/disable cookie secure

> siteUrl / sitePort

configuration for preview only