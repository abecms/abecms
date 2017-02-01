# Abe slug

> abe type slug allow you to create custom url easily

## Example

> inside **template** folder open any template and add

```html
{{abe type="slug" source="name-of-the-page"}}
```

Warning:

- no extensions
- path will be concatened with **structure** folder selection

## Variables

> this will be compiled with handlebars
> You can use single variable, or statements

variables can be added to slug url

```slug
{{abe type="slug" source="{{variableName}}"}}

{{abe type="text" key="variableName" desc="Name of the post" tab="slug"}}
```

Warning:

- if you don't add `tab=slug` attribute the variable will not be avaliable on the slug form

## Multiples variables

```slug
{{abe type="slug" source="{{folderCustom}}/{{variableName}}"}}

{{abe type="text" key="variableName" desc="Name of the post" tab="slug"}}
{{abe type="text" key="folderCustom" desc="Path of the post" tab="slug"}}
{{abe type="text" key="category" desc="Category of the post" tab="slug"}}
```

Warning:
Category is not used in abe slug source `source="{{folderCustom}}/{{variableName}}"` but will be contribued into the slug form

-

You can use all abe `type` in the slug form

[abe-attributes](abe-attributes.md)