# Abe attributes

> abe tags can own many attributes

for example the type text, some required and other optional

```
{{abe type='text' key='text_key'}}
```

- type
- key

are always required for all content type

## Type of abe content

- text
- image
- textarea
- translate
- import
- file
- rich
- link

## Other attributes

- desc (String)
- tab (String)
- reload (Boolean)
- required (Boolean)
- visible (Boolean)
- order (Int)
- filetype (String)
- file (String)
- locale (String | variable)
- max-length (Int)
- min-length (Int)
- display (String)
- editable (Boolean)
- source (String | variables)
- autocomplete (Boolean)

## Details 

type  | example | description | types | Default
--- | --- | --- | --- | ---
desc | ```desc="some description for the contributor"``` | (text only) | all | (null)
tab | ```tab="Image"``` | Will show input into a tab (text only) | all | "default"
reload  | ```reload="true"``` | Will reload the page on input blur (usefull to trigger some javascript on change) | all | "false"
required  | ```required="true"``` | Calculate completion of content | all | "false"
visible  | ```visible="false"``` | will not insert value into html | all | "false"
order  | ```order="10"``` | Order input into admin form | all | (null)
filetype  | ```filetype="image"``` | for upload | file | (null)
file  | ```file="partial.html"``` | for partials import | import | (null)
locale  | ```locale="fr"``` | for translate | translate | String or Variable (with {{lang}}) (default null)
max-length  | ```max-length="5"``` | List max choice N | data | (null)
min-length  | ```min-length="5"``` | List min choice N (used with required attribute) | data | (null)
display  | ```display="title"``` | List from json source display title attribute | data | (null)
editable  | ```editable="false"``` | List is editable | data | true
source  | ```source="[ data source ]"``` | List json value (http url, local url, static json, select sql like) | data | (null)
autocomplete  | ```autocomplete="true"``` | change the list to autocomplete | data | false


