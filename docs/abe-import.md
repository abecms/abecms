# Abe translate

> translate any type of content

/path/to/abe/project/**partials**

### structure

```
partials
   |_ head.html
   |_ footer.html
   |_ etc...
```

Inside abe template

```html
{{abe type='import' file='head.html'}}
```

this will replace the **'{{abe type='import' file='head.html'}}'** with file content of head.html

> if the key doesn't exist this will replace **'{{abe type='import' file='head.html'}}'** with nothing