# Abe handlebars helpers

> Abe handlebars helpers will make your template designer life easy !

## attrAbe
## className
## cleanTab
## slugify
## ifCond
## ifIn

## isTrue

###Example

```html
{{#if (isTrue (isTrue (isTrue top_things_night '||' top_things_cafe) '||' top_things_restaurant_sofitel) '||' top_things_restaurant)}}
```

###Description

This helper returns a boolean depending on the test it does. The available tests :
- '==' : test equality between 2 values
- '===' : test strict equality between 2 values
- '<' : test if value1 is strictly less than value2
- '<=' : test if value1 is less or equal  than value2
- '>' : test if value1 is strictly more than value2
- '>=' : test if value1 is equal or more than value2
- '&&' : test if value1 and value 2 are true
- '||' : test if value1 or value2 is true

###Parameters
```html
{{isTrue value1 operator value2}}
```

> __value1__ = The first value to be tested
> 
> __operator__ = the operator (see above)
> 
> __value2__ = The second value to be tested

###Usage
You can use ifTrue after a {{#if }} statement :
```html
{{#if (isTrue object1 '||' object2)}}
```

You can chain ifTrue tests if you want to test multiple parameters :
```html
{{#if (isTrue (isTrue 4 '==' 5) '||' object1)}}
```

## math
## moduloIf
## notEmpty
## printJson
## testObj
## i18nAbe
## times