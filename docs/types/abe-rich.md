# Abe type rich

> Abe type __rich__

###Basic example

```html
{{abe type='rich' key='rich_key' desc='give some tips' tab='default'}}
```

This will display the rich default rich textarea based on [wysiwygjs](http://wysiwygjs.github.io/)

A toolbar attribut allow to customize the rich textarea (display / hide customization buttons), by default toolbar="*"

###Toolbar parameters
- bold
- italic
- underline
- strikethrough
- forecolor
- highlight
- align (add align [left|right|center|justify] buttons)
- subscript
- superscript
- indent (add [indent|outdent] buttons)
- insertList
- removeFormat
- insertLink
- code
- list (ordered & unordered)
- media (upload image & video)
- format (h1, h2 ...)
- font (font-family)
- fontsize

exemple :

```html
{{abe type='rich' key='may_text_rich' desc='some description' toolbar='bold,italic'}}
```
