When we call the abe/editor path :

cms.editor.create(text, json)

1. We instantiate a Form object
2. We update the JSON with external data
    updateJsonWithExternalData(text, jsonPage)
    - I search all Abe tags with type `data`
    - we launch grabDataFrom(jsonPage, match[0]) for each one and update the JSON
    - I search all tags with a source attribute source (exluding those in types `data` and `import`)
    - We launch grabDataFromSource(jsonPage, match) for each one and update the JSON
3. I add the Abe tags data (not in an each statement) in the Form object
   - addDataAbeTagsToForm(text, json, form)
4. I add abe tags not in data or each statement to the Form object
5. I add abe tags in each statement to the Form object
6. I reorder the Form blocks

I return the json + blocks

This is the route that returns the json + blocks and create the form + the iframe with the page url called through an ajax call
Once the form has been created on the client, an ajax call includes the json clientside (because it is modified dynamically while editing) and the HTML is then built and returned to the client

## FIRST CALL

client                                  server
/abe/edit/my-page.html      ---->       get the json, the template
                                        updates the json
                                        creates the form
                            <----
creates the form and
the iframe then call
/abe/page/my-page.html
with the json in parameter  ---->       create the HTML page with
                                        the json and the template
                            <----
Display the HTML
in the iframe

## DURING EDITION
the json clientside is dynamically updated without a call to the server
If I click on `draft` or another button, we call the server with the json



# What could be improved
1. Let's go back to handlebars regular parsing
2. create a oneway binding => https://blog.risingstack.com/writing-a-javascript-framework-data-binding-es6-proxy/ + https://github.com/mateusmaso/handlebars.binding


