# Abe paging

How to paginate result from abe data select

Example:

```html
{{abe type='data' key='articles' desc='' source='select * from / where template=article' editable="false" tab='default' paginate="10"}}
```

Use of new parameters paginate="N"

### Publish

When publishing a file for example index.html with a data select paginate

if I have 30 articles and I paginate 10 content on this index when publishing my file 3 html will be created

- index.html (1 -> 10 articles)
- index-1.html (10 -> 20 articles)
- index-2.html (20 -> 30 articles)

### How to display page

New variables are set inside "abe_meta.paginate"

```json
"paginate": {
  "links": [
    {
      "link": "/index.html",
      "index": "1"
    },
    {
      "link": "/index-2.html",
      "index": "2"
    },
    {
      "link": "/index-3.html",
      "index": "3"
    }
  ],
  "size": "10",
  "current": "1"
}
```

So you can use simple handlebar to make you paging, like this

```html
{{#each abe_meta.paginate.articles.links}}
	<a href="{{this.link}}"
	{{#ifCond index @root.abe_meta.paginate.articles.current}}style="color: red"{{/ifCond}}
	>{{index}}</a>
{{/each}}
```

this will render

```html
<a href="/index.html" style="color: red">1</a>
<a href="/index-2.html">2</a>
<a href="/index-3.html">3</a>
```