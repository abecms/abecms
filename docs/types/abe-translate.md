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
  "bla bla bla": "anything"
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

# Create a multilingual website in 2 minutes
1. Create a "structure" directory (at your website root) and create dirctories of your locales. Example:
  - /en
  - /fr
2. When you will create your post, select the language in which you want to create it and give it a name (ex. myPost). The url will be /fr/myPost.html
3. the attribute ```level-1``` will contain the directory name in your json document.
4. You can then use this attribute to select your translation file:
  - ``` {{abe type="translate" source="myKey" locale="{{level-1}}"}} ```
  - Abe will search the key 'myKey' in the file /locales/fr.json and return the corresponding value
 
