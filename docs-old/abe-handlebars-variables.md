# Abe handlebars variable

> Abe admin is rendered with handlebar engine, global variables are added inside template rendering.

## Editor

When on the admin edit view `abeEditor` is set to `true` otherwise set to `false`.

```html
{{#if abeEditor}}
    Html rendered inside post when user edit the post
{{else}}
    Html rendered when user "publish" the post (final output)
{{/if}}
```
