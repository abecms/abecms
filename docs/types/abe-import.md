# Abe import

> includes a partial

### structure

1. If the value of the attribute `file` doesn't start with `/`, the file is imported from 'partials' folder (/path/to/abe/project/**partials**)

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

2. If the value of the attribute `file` starts with `/`, the file is imported from the absolute path using the root path of your abe site directory (/myAbsoluteAbeSiteDiectory`/path/entered/in/file/attribute`)

```
my-folder-in-my-abe-site
   |_ head.html
   |_ footer.html
   |_ etc...
```

Inside abe template

```html
{{abe type='import' file='/my-folder-in-my-abe-site/head.html'}}
```

this will replace the **'{{abe type='import' file='/my-folder-in-my-abe-site/head.html'}}'** with file content of head.html

> if the key doesn't exist this will replace **'{{abe type='import' file='head.html'}}'** with nothing

> abe type="import" is not usable in a {{#each}} statement for technical reasons. But you can reproduce this behavior by using the array notation in an import. ie. {{abe type="import" file="myPartial/{{list[].id}}"}} This is particularly useful when you propose a contributor to select several partials in a list (with the {{#each}} notation + type="data). You can then display these selected partials with this array style notation.


