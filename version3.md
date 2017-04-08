# AbeCMS version 3.0.0

![Screenshot](/tests/demo/site/images/ss-v3.png?raw=true)

# Introduction
Dear all, I've decided to create this new major version after all your requests and comments:

You wanted a cleaner design, more professional and appealing for your customers and users, and while you wanted more features, it was mandatory
that AbeCMS keeps its simplicity and ease of use.

In the meantime, I wanted this version 3 to point in the right direction: Version 2 was the complete refactoring of the engine. Version 3 will be the complete refactoring of the REST server. And version 4 will be a complete rewriting of the editor client.

The version 3.0.0 I propose you here is exactly that: The result of a deep refactoring keeping your requests atop and heading to a real REST server. Contentful was inspiring in this spirit and the way it handles Content seems to me the right way. Here it is: You'll be able to use AbeCMS as a an API-first CMS.

Furthermore, I've decided to drop the support of versions 4 & 5 of NodeJS. It doesn't mean AbeCMS won't work anymore in these versions (actually, I did develop AbeCMS 3.0.0 with NodeJS 4.x as a platform), but it means that I'll remove the Travis Unit Testing during the evolutions of the version 3. So migrate to version 6+ of NodeJS in the meantime.

The following chapters will introduce you to the main new features of this version 3.

Enjoy! (and come contribute)


# AbeCMS Back-office

## Design

With advices from Disko agency, my friend @opompilius has taken on his free time during nights and week-ends to work on a new design. The most important thing being that this design will be evolutive. So prepare to see changes and evolutions to embrace the best practices in UX!

AbeCMS first page is now a regular homepage displaying a dashboard with widgets. In the future, you'll be able to choose among a set of widgets. In this version, you'll find stats on your blog, the activity stream and news from AbeCMS community, so that you can stay up to date with new versions and announcements.

You'll find a menu on this homepage making all the features of AbeCMS easy to find.

We've decided to add a header on AbeCMS. It will display your profile (with your gravatar avatar if you have one) and responsive options when you'll be on the editor. Have a try and let us know how you feel with this new design.

## Activity stream
The activity stream displays in real time all the activity which occur on your blog. Really useful when you have several editors working on your AbeCMS website.

## Pixel tracker
We've added a pixel tracker to make statistics on the use of AbeCMS Back-office. It will help us improve your experience. We only count the number of times you go on your back-office, and the pages you use (is the structure page used or not, this kind of stats). If you don't want us to track your connection to the Back-office, you can remove the tracker by deleting the ligne 9 of server/views/partials/header-menu.html. We'll add an option in abe.json to deactivate the tracker in a future version.
But if you keep it, great ! It's a way for you to contribute to the improvement of AbeCMS.

## Editor

### Responsive preview added
You can now see your page in mobile, tablet and desktop version in your editor with just one click

### Auto-republish
If you have pages that depend on other pages (ie. a homepage listing your last published posts), you had previously to launch a button "republish all" in the manager to re-index these pages. We've automatized it in version 3. Forget it: All your pages will be dynamically updated when you publish a new post!
This new feature is set for blog < 500 published posts. This feature is configurable in abe.json:

```
"publish": {
  "url": "site",
  "auto-republish": {
    "active": true,
    "limit": 500
  }
},
```

You can deactivate this feature with ```"active": false``` and change the limit. Above this limit, the auto-republish is replaced with a button thaht you'll click manually when you want your whole blog to be updated. We're working to optimize the recalculation of the new pages so that this auto-republish can be set for any number of posts you have in your blog. For now, a republish of your whole website take around 1' for 1000 posts.
When the button is set, if a user triggers it, all users on the back-office will be informed in real time and the button will be disabled while the republish operation takes place.

### RTE
The RTE in your editor (when you have a wysiwyg field on your post) has been improved:
- fix: It's now possible to change a link
- fix: Image upload RTE is now in the right position
- feature: We've added font selection and font size in the RTE

We're working hard on the RTE and we plan to change the RTE in future versions to give you more possibilities.


# AbeCMS Engine
The engine is the most important part of AbeCMS. Here are the main features and fixes we've done on this version:

## Posts history
Until now, there were no possibility to limit the number of versions you have for a post: We keep all versions o a post you're working on. And after 1 year of updates, you had often dozens of versions of the same post.

It's now possible to limit the number of versions of a post. Just add this option in your abe.json:
```
"data": {
  "history": 3
},
```
The entry history will keep the number of versions you specify (+ keep the publihed version if there is one). By default, we don't put no limit. So you'll have to put this history limit in your abe.json file.


## Group attribute
You could create tabs to organize your content. You now can also create group inside a tab. There are 2 ways, depending on what you want to do:
- if you name your tags with a key like "mygroup.name", all the tags with the same prefix (mygroup) will be gathered in a group on your editor.  Furthermore, these fields will be also gathered in your json document. And if you add a group attribute, then the content of this attribute will be used in the display of the group title in the editor.
- if you add a group attribute in your abe tags (ie. {{abe type="text" key="title" group="my first group" desc="title"}}) with no prefix in the keys, all the fields with the same group name will be gathered in the editor (but not in your json)

## Value attribute
If you put a "value" attribute on your abe tag, the content of your attribute will be used as a default value in the field.

## Thumbs attribute on your Abe tag type "image"
Previously, you could create "thumbs" of an uploaded image with syntax like: {{abe type="image" thumbs="200x150, 600x400"}}. It's now possible to resize your images only on their width or height: {{abe type="image" thumbs="200x, x400"}}. In this example, the first thumb 200x will resize the image so that its width is 200px. The second one x400 will resize the image based on its height.

## New method "abify"
for the plugin developpers, this new method ```cmsOperations.abify(json, template)``` will give you the ability to create a HTML file by sending a JSON + an abified html.

## SMTP gateway ready for many providers
For the plugin developpers, it's now possible to create plugins which send emails. See the doc abe-smtp for details.
For example, you could create a REST route available ON THE WEB (and not only to the back-office) so that users of the static website cans use this route to send emails.


## Fixes
- fix: improper synchro of assets in /site for specific cases
- fix: if /site is a symlink dir-compare did break
- fix: Abe tags now can contain "-"
- fix: We can now have "(" or "[" in abe tabs
- fix: We've removed all <abe> tags in editor version (no more problem with sliders and css) and replaced it with comments


# AbeCMS REST server
This is a great evolution of AbeCMS. You've asked for it. We've done it: AbeCMS is a static website generator. But you'll be able to use AbeCMS as a REST server to expose features to your static website users !
With just a line in your abe.json, you'll tell AbeCMS to have a "static" behavior or "rest" behavior.
AbeCMS is also ready to serve your posts as JSON so that you may consume your content in your native mobile developments or any development requiring different templates ! This is the API-first CMS version of AbeCMS !
Many examples and how-to's to come. 

For now:
- REST authenticate: You may authenticate to the oAuth2 server of AbeCMS to be able to used authenticated routes
- REST read-only routes: You may serve posts from mobile apps or others with a complete filter/search API (more to come)
- Abe is now CORS ready so that any domain (with proper authentication token) can request content from AbeCMS.


# Migration from a version 2 => 3
To migrate from a version 2, you'll have to make sure to refactore (if used) these methods
- src/cli/cms/operations/remove.js function has a new signature. It was previously ```cmsOperations.remove(jsonPath, htmlPath)```. It's now ```cmsOperations.remove(filePath)```. You'll have to call it 2 times if you want to remove a json file and a html file.
- src/cli/cms/Page.js class has a new signature. it was previously ```new Page(templateId, template, json, onlyHTML)```. It's now ```new Page(template, json, onlyHTML)```


