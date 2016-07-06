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
  "size": "9",
  "current": "1",
  "first": "/index.html",
  "next": "/index-2.html",
  "last": "/index-3.html"
}
```

So you can use simple handlebar to make you paging, like this

```html
{{#if abe_meta.paginate.push_main.first}}
<li>
    <a href="{{abe_meta.paginate.push_main.first}}" class="">first</a>
</li>
{{/if}}
{{#if abe_meta.paginate.push_main.prev}}
<li>
    <a href="{{abe_meta.paginate.push_main.prev}}" class="">prev</a>
</li>
{{/if}}
{{#each abe_meta.paginate.push_main.links}}
    <li>
        <a href="{{this.link}}" class="{{#ifCond index @root.abe_meta.paginate.push_main.current}}[ selected class ]{{/ifCond}}">
            {{index}}
        </a>
    </li>
{{/each}}
{{#if abe_meta.paginate.push_main.next}}
<li>
    <a href="{{abe_meta.paginate.push_main.next}}" class="">next</a>
</li>
{{/if}}
{{#if abe_meta.paginate.push_main.last}}
<li>
    <a href="{{abe_meta.paginate.push_main.last}}" class="">last</a>
</li>
{{/if}}
```

this will render

```html
<a href="/index.html" style="color: red">1</a>
<a href="/index-2.html">2</a>
<a href="/index-3.html">3</a>
```