# Abe type data

> Abe type __data__ allow you to make your static website more __dynamic__

## How does it works ?

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

optrionnal parameter

- desc = (String)
- editable = (Boolean)
- max-length = (Int)
- display = (String)
- reload = (Boolean)
- autocomplete = (Boolean)

##Use it

Display user picked values into your html files

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
{{abe type='data' key='title' desc='Pick a title' source='[{"title":"My article"},{"title":"My website"},{"title":"My blog"}]' display="title" editabl="true"}}
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
{{abe type='data' key='title' desc='Pick a title' source='references/titles.json' display="title" editabl="true"}}
```

> http webservice

Same as inline json file but with __http__ request

```html
{{abe type='data' key='title' desc='Pick a title' source='http://mywebsite.url/titles/webservice' display="title" editabl="true"}}
```

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

###WHERE

```html
{{abe type='data' key='articles' desc='articles' source="select * from articles where title='my title'" display="title" editable='true'"}}
```

(*Only take article if __title__ is "my title"*)

__OPERATOR__

- =
- !=
- LIKE

###AND

```html
{{abe type='data' key='articles' desc='articles' source="select * from articles where template="article" AND title='my title'" display="title" editable='true'"}}
```

(*Only take article the type of the template is __article__ and the __title__ is "my title"*)

###OR

```
Not working
```

###LIMIT

```html
{{abe type='data' key='articles' desc='articles' source="select * from articles where template="article" AND title='my title' LIMIT 2" display="title" editable='true'"}}
```

(*Will not add more than __two__ article because of the limit*)

ORDER BY date
- DESC
- ASC

```html
{{abe type='data' key='articles' desc='articles' source="select * from articles where template="article" AND title='my title' order by date DESC LIMIT 2" display="title" editable='true'"}}
```

(*Order by date only*)

##Use it

```html
{{#each articles}}
	<span classs="author">{{this.title}}</span>
{{/each}}
```

> complex json

If you use a complex json data source for example

```json
{
	"articles": [
		{"title":"my title number 1"},
		{"title":"my title number 1"}
	]
}
```

You request may look like this

```html
{{abe type='data' key='articles' desc='articles' source="select * from articles where \`articles.title\`='my title number 1'" display="articles.title" editable='true'"}}
```

notice the use of sql syntax ```\` ``` on ```\`articles.title\` ``` to select title from article object


##Dynamic variable select

Select where can have dynamic variable too

we want to use colors value inside sql where select
First we declare an array of colors (*inline / file / webservice*)

```html
{{abe type='data' key='colors' desc='Pick a color' source='["red", "green", "yellow"]'}}
```
then we select all article with title = colors using ```{{}}``` around variable

```html
{{abe type='data' key='articles' desc='articles' source="select * from articles where title='{{colors}}'" editable='true'"}}
```
(*if the user choose "red" then save the request will look like* __```select * from articles where title='red'```__)

##Other parameter

> editable="true"

will allow user to select from the data source otherwise all data will be used as value

> max-length="2"

if the max length is set user will on be able to select N entries (*for example 2*)

> autocomplete="true"

change the form to autocomplete 