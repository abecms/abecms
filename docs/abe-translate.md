# Abe translate

> translate any type of content

/path/to/abe/project/**locales**

### structure

```
locales
   |_ fr.json
   |_ gb.json
   |_ de.json
   |_ etc...
```

Example json

> gb.json

```json
{
  "Home": "Home",
  "bla bla bla": "anything",
}
```

Inside abe template

```html
{{abe type="translate" source="bla bla bla" locale="fr"}}
{{abe type="translate" source="bla bla bla" locale="{{lang}}"}}
{{abe type="translate" source="{{variable}}" locale="{{lang}}"}}
```

this will replace the **'bla bla bla'** with **'anything'**

> if the key doesn't exist this will use **'bla bla bla'** instead