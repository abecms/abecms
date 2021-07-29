# Type _file_

> AbeCMS type __file__.

## Basic example

```html
{{abe type='file' filetype='file_type' key='file_key' desc='give some tips' tab='default'}}
```

## Parameters

- __type__ = file
- __key__ = references key to use into your HTML

Optional parameters:

- desc = (String)
- display = (String)
- reload = (Boolean)
- keepName = (Boolean)

## keepName
By default, Abe will create your file with a random string at the end of the file. If you want to keep the exact name of the file you upload, add this parameter `keepName='true'`
