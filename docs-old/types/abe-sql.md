# Abe sql request

# RULES

## Quotes/Double quotes

```
select some_variable from / where `title`='mon title' => NOT OK
select some_variable from / where `title`=`mon title` => OK
```

## Meta

The variable abe_meta. When you select a document even if you don't require meta they'll be added to the result

Request:
```
select some_variable from /
```

Result:
```json
{
  "some_variable": "some_value",
  "abe_meta": {
    "template": "template_name",
    "link": "/web/url/of/document.html",
    "status": "publish",
    "date": "2016-07-11T16:40:41.974Z"
  }
}
```

## Dynamic variables

You can use document variable to select document (use `{some_variable_name}`)

Request:
```
select some_json_variable from / where abe_meta.link != `{{abe_meta.link}}`
```

*this request will select all document except the same as the current one

Explaination:
select the variable `some_json_variable` from `root` directory, where the child json variable from `abe_meta` named `link` is not the same as (where the magic append) `current doc abe_meta.link` (ex: /path/to/the/document)

Variable can be use on the value or the key inside request

```
select some_json_variable from / where {{abe_meta.link}} != `abe_meta.link`
```
* In this case the result is the same

# OPERATORS

## =

Request:
```
select some_variable from / where `title` = `a title`
// ex with variables
select some_variable from / where `title` = `{{title}}`
select some_variable from / where `{{title}}` = `title`
```

## !=

Request:
```
select some_variable from / where `title` != `a title`
// ex with variables
select some_variable from / where `title` != `{{title}}`
select some_variable from / where `{{title}}` != `title`
```

## >

Request:
```
select some_variable from / where `some_variable_counter` > 1
// ex with variables
select some_variable from / where `some_variable_counter` > `{{some_variable_counter}}`
select some_variable from / where `{{some_variable_counter}}` > 1
```
* work only on numbers

## >=

Request:
```
select some_variable from / where `some_variable_counter` >= 1
// ex with variables
select some_variable from / where `some_variable_counter` >= `{{some_variable_counter}}`
select some_variable from / where `{{some_variable_counter}}` >= 1
```
* work only on numbers

# <

Request:
```
select some_variable from / where `some_variable_counter` < 1
// ex with variables
select some_variable from / where `some_variable_counter` < `{{some_variable_counter}}`
select some_variable from / where `{{some_variable_counter}}` < 1
```
* work only on numbers

## <=

Request:
```
select some_variable from / where `some_variable_counter` >= 1
// ex with variables
select some_variable from / where `some_variable_counter` >= `{{some_variable_counter}}`
select some_variable from / where `{{some_variable_counter}}` >= 1
```
* work only on numbers

## LIKE

Request:
```
select some_variable from / where `some_variable_string` LIKE `part_of_a_string`
// ex with variables
select some_variable from / where `some_variable_string` LIKE `{{some_variable_string}}`
select some_variable from / where `{{some_variable_string}}` LIKE `part_of_a_string`
```

## NOT LIKE

Request:
```
select some_variable from / where `some_variable_string` NOT LIKE `part_of_a_string`
// ex with variables
select some_variable from / where `some_variable_string` NOT LIKE `{{some_variable_string}}`
select some_variable from / where `{{some_variable_string}}` NOT LIKE `part_of_a_string`
```

## AND

Request:
```
select some_variable from / where `title` = `a title` AND `abe_meta.template` = `template_name`
// ex with variables
select some_variable from / where `title` = `{{title}}` AND `abe_meta.template` = `{{abe_meta.template}}`
select some_variable from / where `{{title}}` = `a title` AND `{{abe_meta.template}}` == `template_name`
```

## OR

Request:
```
select some_variable from / where `title` = `a title` OR `abe_meta.template` = `template_name`
// ex with variables
select some_variable from / where `title` = `{{title}}` OR `abe_meta.template` = `{{abe_meta.template}}`
select some_variable from / where `{{title}}` = `a title` OR `{{abe_meta.template}}` == `template_name`
```

## IN

Request:
```
select some_variable from / where `abe_meta.template` IN (`template_name_1`, `template_name_2`, `template_name_3`)
// ex with variables
select some_variable from / where `template` IN (`{{variable_array}}`)
select some_variable from / where `{{abe_meta.template}}` IN (`a title`)
// ex with an array
select some_variable from / where `array.attribute` IN (`{{variable_array}}`)
// the previous example is equivalent to this notation (notice the [] to indicate an array)
select some_variable from / where `array[].attribute` IN (`{{variable_array}}`)
```

variable_array can be something like this

Use case :

If the json look like this

```json
{
  "variable_array": [
      "abe_meta": {
      "template": "homepage",
      "link": "/homepage-1.json",
      "status": "publish",
      "date": "2016-07-11T16:40:41.974Z"
    },
    "abe_meta": {
      "template": "article",
      "link": "/article-1.json",
      "status": "publish",
      "date": "2016-07-11T16:40:41.974Z"
    }
  ]
}
```

the result of the request look like that

```
select some_variable from / where `template` IN (`{{variable_array}}`)

=

select some_variable from / where `template` IN (`homepage`, `article`)
```

Use case :

If the template looks like this:

```json
{{abe type="data" key="products" source="select title,cover_300x200 from /products where `abe_meta.template`=`product`" desc="select products" display="{{title}}"}}

{{abe type="data" key="other_recipes" source="select title,cover_300x200 from /recipes where `products.title` IN (`{{products}}`) AND `abe_meta.link`!=`{{abe_meta.link}}`" editable="false"}}
```

> we could have written the other_recipes request this way (see the [] in products[].title):
```json
{{abe type="data" key="other_recipes" source="select title,cover_300x200 from /recipes where `products[].title` IN (`{{products}}`) AND `abe_meta.link`!=`{{abe_meta.link}}`" editable="false"}}
```

If the json post looks like this

```json
{
  "name": "r2",
  "recipe": "Recipe 2",
  "products": [
    {
      "title": "p1",
      "cover_300x200": "/image/turkey_300x200.jpg",
    },
    {
      "title": "p3",
      "cover_300x200": "/image/chicken_300x200.jpg",
    }
  ]
}
```

the result of the request will return all the recipes containing one or more products included in the json post (containing p1 or p3 or both)

## NOT IN

Request:
```
select some_variable from / where `abe_meta.template` NOT IN (`template_name_1`, `template_name_2`, `template_name_3`)
// ex with variables
select some_variable from / where `template` NOT IN (`{{variable_array}}`)
select some_variable from / where `{{abe_meta.template}}` NOT IN (`a title`)
// ex with an array
select some_variable from / where `{{array.attribute}}` NOT IN (`{{variable_array}}`)
// the previous example is equivalent to this notation (notice the [] to indicate an array)
select some_variable from / where `{{array[].attribute}}` NOT IN (`{{variable_array}}`)
```

Same as `IN`

```
select some_variable from / where `template` NOT IN (`{{variable_array}}`)

=

select some_variable from / where `template` NOT IN (`homepage`, `article`)
```

## ORDER BY

### DESC

```
select some_variable from / ORDER BY date DESC
```

### ASC

```
select some_variable from / ORDER BY date ASC
```

### RANDOM

```
select some_variable from / ORDER BY random
```

## LIMIT

```
select some_variable from / LIMIT 10
```
