# Abe document

When a user "draft" or publish a document in Abe, A json is created or updated.

This json contains all the data you have created in your template + a special record named "abe_meta"

## abe_meta
This record contains data about your document:

```
  "abe_meta": {
    "template": "spec-component",
    "link": "/specs/oliv.html",
    "createdDate": "2017-06-26T07:18:34.533Z",
    "createdBy": "admin",
    "updatedDate": "2017-07-03T07:20:19.080Z",
    "updatedBy": "admin",
    "status": "draft",
    "complete": "100"
  }
```

### template
This attribute contains the template used to fill in the data

### link
This attribute is the URL path to the document

### createdDate
The creation date of this document

### createdBy
Who has created the document

### updatedDate
The last modification date of the document

### updatedBy
Who has made the last modification to the document

### status
The status of the document

### complete
If the document contains mandatory fields, the % of filled in mandatory fields

## Additional fields in abe_meta
abe_meta may contain additional fields: you can create additional fields using a regular Abe tag:

```{{abe type="text" key="abe_meta.myAttribute" desc="description"}}

This way, when a user save a document, you will add myAttribute to the abe_meta record of the document.

## Special attribute in abe_meta
There is one hidden gem in Abe giving you the possibility of creating different pages from the same document: relatedTemplates

### relatedTemplates
You may use this special attribute to create different pages on publish. This is particularly relevant if you want to create AMP pages or instant articles pages associated with the main page. It can also be used to create a PDF version of your page, a mobile version ... Whatever ! Sky is the limit !

```
  {{abe type='text' key='abe_meta.relatedTemplates.myAmp.template' value='amp' editable='false' visible='false'}}
  {{abe type='text' key='abe_meta.relatedTemplates.myAmp.path' value='amp/articles' editable='false' visible='false'}}
  {{abe type='text' key='abe_meta.relatedTemplates.myAmp.extension' value='html' editable='false' visible='false'}}
```

This example will record this abe_meta:
```
"abe_meta": {
  "template": "example",
  "link": "/components/example.html",
  "createdDate": "2017-06-26T07:33:45.122Z",
  "createdBy": "admin",
  "updatedDate": "2017-07-02T23:31:59.687Z",
  "updatedBy": "admin",
  "status": "draft",
  "complete": "100",
  "relatedTemplates": {
    "myAmp": {
      "template": "amp",
      "path": "amp/articles",
      "extension": "html"
    }
  }
}
```

And on publish, 2 pages will be published:
- /components/example.html (the regular one)
- /amp/articles/eample.html (the related page)

#### relatedTemplate.template
The name of the template to use

#### relatedTemplate.path
The path to use when you create the page

#### relatedTemplate.extension
The extension of the page to create
