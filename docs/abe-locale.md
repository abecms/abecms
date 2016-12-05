# Abe locale

> translate Abe backoffice texts

## Config Abe

set a property ```siteLocaleFolder``` to your abe.json file which link to your folder on your website source

exemple :

```javascript
{
	"siteLocaleFolder": "mylocales"
}
```

Under mylocales folder you can add a folder named en-US which is the default lang value or you can override this lang inside abe.json this way

```javascript
{
	"intlData": {
    "locales": "fr-FR"
  }
}
```

After doing this you can add as many json files as you want inside mylocales/fr-FR/ and the json key values will be merged with exsting locales values
