# Abe config

> Create a file abe.json at the root of your abe project.

```json
{
    "localeFolder": "locale",
    "intlData": {
        "locales": "en-US"
    },
    "upload": {
        "image": "image",
        "fileSizelimit": 10485760
    },
    "csp": {
        "scriptSrc": [],
        "styleSrc": [],
        "imgSrc": [],
        "childSrc": [],
        "frameAncestors": [],
        "mediaSrc": [],
        "fontSrc": [],
        "connectSrc": []
    },
    "security": true,
    "htmlWhiteList": {
        "blockquote": ["style"],
        "span": ["style"],
        "font": ["style", "color"],
        "div": ["style"],
        "sup": ["style"],
        "sub": ["style"],
        "ul": ["style"],
        "li": ["style"],
        "p": ["style"],
        "b": ["style"],
        "strong": ["style"],
        "i": ["style"],
        "u": ["style"],
        "a": ["style", "href"],
        "br": [],
        "h1": ["style"],
        "h2": ["style"],
        "h3": ["style"],
        "h4": ["style"]
    },
    "files": {
        "templates": {
            "extension": "html",
            "assets": "_files",
            "precompile": true
        }
    },
    "cookie": {
        "secure": false
    },
    "siteUrl": false,
    "sitePort": false
}
```

> LocalFolder

To change locale.

> Upload

Asset upload into the backoffice.

> CSP / security

Enable/disable security + config.

> `htmlWhiteList`

Wysiwyg configuration.

> files

File extension + [ folder ]_files assets.

__precompile__ (false by default): If set to true, the templates are precompiled by Handlebars. Big performance improvement. This precompilation occurs when a page is displayed in Abe. While you design your templates, set this option to false and clear the hbs directory (in your templates directory) for reinitializing the cache.

> cookie

Enable/disable cookie secure.

> siteUrl / sitePort

Configuration for preview only.
