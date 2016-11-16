# Abe precontrib

> abe tags can have 3 new attributes to create precontribution form

### Attributes

- precontrib: true | false
- slug: true | variable_name_to_use
- slugType: path | name

### precontrib attribute

will add abe tag on precontribution form

### precontrib slug

if "true" the value into the form will be added to the slug url
you can use "variable_name" if the format is an object

### precontrib slugType

if slug type = "name" the value will be concatenated to last part of the slug separated with "-"
if slug type = "path" the value will be concatenated to slug separated with "/"

# Examples:

for example the type text, some required and other optional

```
{{abe type='text' key='text_key' precontrib="true" slug="true" slugType="path"}}
```

The value will look like /some/folders/[ input text_key value ]/filename

```
{{abe type='text' key='text_key' precontrib="true" slug="true" slugType="name"}}
```

The value will look like /some/folders/[ input text_key value ]

```
{{abe type='text' key='text_key' precontrib="true"}}
```

if you don't add "slug" attribute the input will be visible on the precontribution but not added to the slug url

# Usefull attribute

- required="true"
- order="[ position of the field ]"
- visible="false"

if visible = false it will not be added to the post saved file