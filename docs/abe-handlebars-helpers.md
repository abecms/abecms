# Abe handlebars helpers

> Abe handlebars helpers will make your template designer life easy!

Abe, by default, contains more than 150 provided by this project: https://github.com/helpers/handlebars-helpers.

So you can use each one of these helpers. Refer to their documentation for their usage.

Additionally, the following Abe helpers have been developped for you:

## attrAbe

## className
### Description

This helper replaces unwanted characters from a string to make it ressemble a className.

e.g. `My string !` => `my_string`

## cleanTab

## slugify

## ifCond
### Description

This helper checks if a condition is true and return the block if it's the case.

## ifIn
### Description

This helper checks if a string is contained inside an array and returns the bloc, if it's  the case.

## raw
### usage (in template)

```html
{{{{raw}}}}
    {{someVariable}}
{{{{/raw}}}}
```

You'll find `{{someVariable}}` in your HTML. This helper is for you if you want to use handlebars on your html generated static pages.

### Use case

For example http://www.bjornblog.com/web/jquery-store-locator-plugin is a jquery plugin which uses handlebars as its dynamic templating language.

`template.html`
```html
<div id="infoTemplate" style="display:none">
  {{{{raw}}}}
  {{#location}}
    {{name}}
    {{address}}
    {{address2}}
    {{city}}{{#if city}},{{/if}} {{state}} {{postal}}
    {{hours1}}{{hours2}}{{hours3}}
    {{phone}}
    {{niceURL web}}
  {{/location}}
  {{{{/raw}}}}
  </div>

<div id="listTemplate" style="display:none">
  {{{{raw}}}}
  {{#location}}
    <li data-markerid="{{markerid}}">
      <div class="list-label">{{marker}}</div>
      <div class="list-details">
        <div class="list-content">
          <div class="loc-name">{{name}}</div>
          <div class="loc-addr">{{address}}</div>
          <div class="loc-addr2">{{address2}}</div>
          <div class="loc-addr3">{{city}}{{#if city}},{{/if}} {{state}} {{postal}}</div>
          <div class="loc-phone">{{phone}}</div>
          <div class="loc-web"><a href="{{web}}" target="_blank">{{niceURL web}}</a></div>
          {{#if distance}}
            <div class="loc-dist">{{distance}} {{length}}</div>
            <div class="loc-directions">
              <a href="https://maps.google.com/maps?saddr={{origin}}&amp;daddr={{address}} {{address2}} {{city}}, {{state}} {{postal}}" target="_blank" style="color: lightskyblue">Directions</a>
            </div>
          {{/if}}
        </div>
      </div>
      <hr>
    </li>
  {{/location}}
  {{{{/raw}}}}
</div>
<script src="https://code.jquery.com/jquery-1.11.3.min.js"></script>
<script src="https://netdna.bootstrapcdn.com/bootstrap/3.1.1/js/bootstrap.min.js"></script>
<script src="/js/handlebars-v4.0.5.js"></script>
<script src="https://maps.google.com/maps/api/js?key=AIzaSyCo_h54Rp4-1ygvmTSWgebLYz6hlcjLO7w&region=FRANCE"></script>
<script src="/js/jquery.storelocator.js"></script>
<script src="/js/jquery.tinycarousel.js"></script>
<script>//var jsonData = {{stores}}</script>
<script>//console.log({{stores}})</script>
<script>
  $(function() {
    $('#bh-sl-map-container').storeLocator({
      debug                      : false,
      fullMapStart               : true,
      mapSettings : {
        zoom                   : 5,
        mapTypeId              : google.maps.MapTypeId.ROADMAP,
        disableDoubleClickZoom : true,
        scrollwheel            : false,
        navigationControl      : false,
        draggable              : true
      },
      lengthUnit               : 'km',
      storeLimit               : 5,
      // Data
      dataType                 : 'json',
      dataLocation             : 'https://raw.githubusercontent.com/bjorn2404/jQuery-Store-Locator-Plugin/master/dist/data/locations.json',
      //dataLocation           : '/stores.html',
      //dataRaw                : jsonData,
      infowindowTemplateID     : 'infoTemplate',
      listTemplateID           : 'listTemplate',
      distanceAlert            : -1
    });
  });
</script>
```

Everything inside raw blocks will be left as is and ready to be compiled client side by handlebars. In this example, it's used to have templates of infowindow and list of stores found on a googlemap.

## lowercase
### Example

```html
{{lowercase 'my Text IS THERE'}}
```

Result: `my text is there`

### Description

This helper... lowercases your text.

## uppercase

### Example

```html
{{uppercase 'my Text IS THERE'}}
```

Result: `MY TEXT IS THERE`

### Description

This helper... uppercases your text.

## truncate

### Example

```html
{{truncate 'my Text which is quite long' 10}}
```

### Description

This helper remove html tags and truncate it.

### Parameters

```html
{{truncate text len}}
```

> __text__ = The text to truncate
> 
> __len__ = the length of the text to keep


### Usage

The text to pass can of course be a handlebars variable:

```html
{{truncate nbVariable 10}}
```

## isTrue

### Example

```html
{{#if (isTrue (isTrue (isTrue top_things_night '||' top_things_cafe) '||' top_things_restaurant_sofitel) '||' top_things_restaurant)}}
```

### Description

This helper returns a boolean depending on the test it does. The available tests:
- '==' : test equality between 2 values
- '===' : test strict equality between 2 values
- '<' : test if value1 is strictly less than value2
- '<=' : test if value1 is less or equal  than value2
- '>' : test if value1 is strictly more than value2
- '>=' : test if value1 is equal or more than value2
- '&&' : test if value1 and value 2 are true
- '||' : test if value1 or value2 is true

### Parameters

```html
{{isTrue value1 operator value2}}
```

> __value1__ = The first value to be tested
> 
> __operator__ = the operator (see above)
> 
> __value2__ = The second value to be tested

### Usage

### Usage

You can use ifTrue after a `{{#if }}` statement:

```html
{{#if (isTrue object1 '||' object2)}}
```

You can chain ifTrue tests if you want to test multiple parameters:

```html
{{#if (isTrue (isTrue 4 '==' 5) '||' object1)}}
```

__CAUTION__: If you want to test a handlebars variable like geocode.code, you'll have to use "../" to access the parent properties.

```html 
{{#if (isTrue (isTrue (lowercase hotelCityCodeGeo) "==" ../geocode.code)}}
```

## math
## moduloIf
## notEmpty
## printJson
## testObj
## i18nAbe
## times
