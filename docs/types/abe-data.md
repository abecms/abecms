# Abe type data

> Abe type __data__ allow you to make your static website more __dynamic__

## How does it work ?

###Basic example

```html
{{abe type='data' key='colors' desc='Pick a color' source='["red", "green", "yellow"]'}}
<!DOCTYPE html>
<html>
	<head>
	...
```

###Parameters

> __type__ = data
> 
> __key__ = references key to use into your html
> 
> __source__ = json data of possible values

optional parameters

- desc = (String)
- editable = (Boolean)
- max-length = (Int)
- display = (String)
- reload = (Boolean)
- prefill = (Boolean)
- prefill-quantity = (Int)
- autocomplete = (Boolean)

##Use it

Display user picked values in your html files

```html
{{#each colors}}
	{{this}}
{{/each}}
```
(*Pure handlebars syntax*)

> remember __colors__ is equal to abe key='colors'

## Source attribute

If you want to use more than inline json data, the source attributes can use many values

- inline json
- relative json file reference path
- http webservice
- Sql like request (use sql SELECT syntax to find published content into abe website)

###Examples

> Inline json

```html
{{abe type='data' key='titles' desc='Pick a title' source='[{"title":"My article"},{"title":"My website"},{"title":"My blog"}]' display="title" editable="true"}}
```

this will __display__ (*because editable is true*) an input select with __3 choices__ (*"My article", "My website", "My blog" are values of title choosed with diplay parameter*)

> relative json file reference path

I have a json file inside my abe website

references/titles.json

```json
[
  {
    "title": "My article"
  },
  {
    "title": "My website"
  },
  {
    "title": "My blog"
  }
]
```

```html
{{abe type='data' key='title' desc='Pick a title' source='reference/titles.json' display="title" editable="true"}}
```

> http webservice

Same as inline json file but with __http__ request

```html
{{abe type='data' key='title' desc='Pick a title' source='http://mywebsite.url/titles/webservice' display="title" editable="true"}}
```

> if you descide to use autocomplete="true"
> 
> http request will be made from the browser
> 
> Exemple: **http://mywebsite.url/titles/webservice/ + my_auto_complete_word_**
>
> if not http request is made from the server to show the result inside select multiple html tag
> Exemple: **http://mywebsite.url/titles/webservice/**

> How to add a variable after /webservice/ from server side request ?
> 
> create a placeholder
> **{{abe type='text' key='my_variable' desc='some variable' tab='default' visible="false"}}**
> 
> don't forget attribute visible="false"
> 
> then you can use the variable inside the url
> 
> Exemple : **{{abe type='data' key='test' source='http://localhost:8000/plugin/service/json/{{my_variable}}' display="title" editable='true' desc='test'}}**
> 
> Warning **my_variable** will be empty on first load the user will need to save at least once with the variable filled

##Sql like request

For example i have the following website structure

```
- mysite/
   |_ site/ (contains published files, this is your static website)
       |_ index.html
       |_ articles/
       |   |_ article-1.html
       |   |_ article-2.html
       |   |_ article-3.html
       |_ blog/
           |_ article-1.html
```

> Basic SELECT example

Inside index.html __template__ I'll add the request below

```html
{{abe type='data' key='articles' desc='articles' source="select * from articles" editable="true"}}
```
This will return a input select with all the 3 articles I have inside my website

If inside article.html __template__ we have an attribute abe key="title" you can only select the title if you want

```html
{{abe type='data' key='articles' desc='articles' source="select title from articles" editable="true"}}
```

> Use the "display" parameter

```html
{{abe type='data' key='articles' desc='articles' source="select title from articles" display="title" editable="true"}}
```
If you want to display inside the input select the "title" value

> More complex SELECT

###FROM

```html
{{abe type='data' key='articles' desc='articles' source="select * from articles, blog" display="title" editable='true'"}}
```

(*select from folder articles and blog*)

```html
{{abe type='data' key='articles' desc='articles' source="select * from /articles" display="title" editable='true'"}}
```

(*select from folder articles with an absolute path*)

- if start with "/" path absolute from mywebsite/site/articles
- if doesn't start with "/" path absolute from articles (if the template is inside blog. And blog is at the same level as articles no result can be found)
- if start with "../" same as relative

Notes: You can use variables on from like this

```html
{{abe type='data' key='articles' desc='articles' source="select * from /{{some_json_key}}/{{some_other}}" display="title" editable='true'"}}
```

##Use it

```html
{{#each articles}}
	<span classs="author">{{this.title}}</span>
{{/each}}
```

##Other parameter

> editable="true"

will allow user to select from the data source otherwise all data will be used as value

> max-length="2"

if the max length is set user will on be able to select N entries (*for example 2*)

> autocomplete="true"

change the form to autocomplete 

> prefill="true"

will add default content values

> prefill-quantity="10"

will as many content as the value


[More documentation about abe sql](abe-sql.md)
