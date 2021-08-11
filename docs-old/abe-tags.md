# Abe tag

> You can add Abe tag to you template following simple rules.

## Abe DOM element

This abe tag will display `text` on the document.

### TEMPLATE

```html
<html>
    <head>
    </head>
    <body>
        {{abe type='text' key='text_dom'}}
    </body>
</html>
```

### RENDER

```html
<html>
    <head>
    </head>
    <body>
        Hello
    </body>
</html>
```

## Abe DOM Attributes

This example will be added to `body > class` HTML attributes.

### TEMPLATE

```html
<html>
    <head>
    </head>
    <body class="{{abe type='text' key='text_class'}}">	
    </body>
</html>
```

### RENDER

```html
<html>
    <head>
    </head>
    <body class="class-hello">		
    </body>
</html>
```

## More examples

#### Multiple attributes

Multiple attributes are allowed on the same HTML DOM object.

```html
<html>
    <head>
    </head>
    <body class="{{abe type='text' key='text_class'}}" id="{{abe type='text' key='text_id'}}">		
    </body>
</html>
```

#### Concatenate with attribute

```html
<html>
    <head>
    </head>
    <body class="my-body-class {{abe type='text' key='text_class'}}">		
    </body>
</html>
```

#### If handlebars

On the next example if variable `text_class` is not empty use `text_class` otherwise use `my-default-class`.

```html
<html>
    <head>
    </head>
    <body class="{{#if text_class}}{{abe type='text' key='text_class'}}{{else}}my-default-class{{/if}}">		
    </body>
</html>
```

# WARNING: THE FOLLOWING EXAMPLE ARE NOT IMPLEMENTED YET

Multiple abe attributes into the same HTML tag.

```html
<html>
    <head>
    </head>
    <body class="{{abe type='text' key='text_1'}}{{abe type='text' key='text_2'}}">		
    </body>
</html>
```

Tips use visible false Abe attribute.

```html
{{abe type='text' key='text_1' visible="false"}}
{{abe type='text' key='text_2' visible="false"}}
<html>
    <head>
    </head>
    <body class="{{text_1}} {{text_2}}">		
    </body>
</html>
```
