# Abe Plugins

> How to create plugins

Inside website (create plugins folders) then an other (you choose the folder name)

You can then add hooks or template override

Example from abe-hint plugins

```
website/
  |_ plugins/
    |_ hint/
      |_ hooks/
      |  - hooks.js
      |_ partials/
      | - some_partials.html ...
      | - some ...
      | - ...
      |_ routes/
        - my_route.js ...
```

Plugins examples at [https://github.com/AdFabConnect/abe-plugins](https://github.com/AdFabConnect/abe-plugins)


## frontend javascript

Your partial can import css/js file

You can register some event to alter abe

for example :

```
website/
  |_ plugins/
    |_ my-plugin/
      |_ partials/
        - styles.html
        - my-scripts.js
```

content of styles.html

```html
<script src="/my-scripts.js"></script>
```

content of my-scripts.js

```javascript
abe.json.saving(function (e) {
  abe.json.data.someVariable = 'test'
})
```

```someVariable``` will be saved into content json file, because the json was changed before saving

## Add route

```
website/
  |_ plugins/
    |_ my-plugin/
      |_ routes/
        - my_route.js ...
```
You now get a new route at ```http://localhost:8000/plugin/my-plugin/my_route``` (this is created fron plugin name 'my-plugin' and 'my_route.js'

Example file:

```javascript
'use strict';

var route = function route(req, res, abe) {
	res.set('Content-Type', 'application/json')
	res.send(JSON.stringify({
		route: 'search',
		success: 1
	}))
}

exports.default = route;
```