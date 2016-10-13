# Raw helper

## usage (in template) :
```
{{{{raw}}}}
	{{someVariable}}
{{{{/raw}}}}
```
someVariable won't compile server side only client side when injected on the iframe or when the iframe reload.

## Use case
This can be useful when working with inline script inside template, for exemple when a JS array is updated with abe-each.

template.html
```
{{#each objs}}
​	{{abe type='text' key='objs.item' desc='some item' visible='false' reload='true'}} // note that there is a reload attr
{{/each}}

{{{{raw}}}}
	// objs = [{item: 1}, {item: 2}, {item: 3}]
	var myArray = [
		{{#each objs}}
			{{item}},
		{{/each objs}}
	];
{{{{/raw}}}}
```

Everything inside raw bloc will be compiled client side and as the reload attribut is on the json that will be used is the one client side (not the one saved inside a json file)
when a new item will be added or removed from abe form *objs* inside the json file won't have changed but as it compiled on the client after reloading the iframe myArray will contains as much item as there is on objs each bloc