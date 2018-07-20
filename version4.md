# AbeCMS version 4

# Introduction

Here comes the version 4! The number of improvements is huge. Mainly, this version is focused on usability and user experience. We've listened to you:

AbeCMS is not a Content Management System anymore, it becomes a Content Marketing as a Service:

Regular Content Management Systems like Drupal or Wordpress focus on the content (easy to say) but lack the full picture. It has become a team job to PLAN, CREATE, DISTRIBUTE, ADVERTISE and MEASURE the content you produce.

And we need a Content Marketing Server for teams. This is what AbeCMS 4 does. 

**This current project is the CREATE part of AbeCMS 4 Content Marketing as a Service. The remaining parts (PLAN, DISTRIBUTE, ADVERTISE, MEASURE) will be available through our SaaS server. We'll let you know when you'll be able to use it !**

# PLAN
Creating content needs a dedicated organization, a team of people and a plan. AbeCMS 4 will include the following features

- A project manager "a la Trello" integrated into AbeCMS so that you may organise the task to create / maintain your content marketing tasks
- A calendar view, so that you easily can view what's planned with whom and when.
- Notifications for people involved in the CM projects : On the platform, by mail, through slack. You to choose !

# CREATE (this project)
We will add some key features in this version to give more power to the template designers. We've also refactored some parts of the code to make it more maintainable and efficient.

We've spent 2 years working with the community to prepare this version. See below what is planned.

- You already may create components and use these components in your templates. Now you'll have a drag and drop editor to create dynamically templates from these components.
- You want to create multiple pages from the same content ? A pdf, the blog post, the AMP and Instant FB page versions ? It's now possible
- You asked us the possibility to create common content between templates. (like using the same content in the footer). It is now possible
- You have more than 50 000 blog posts and want to use a database instead of the filer to host your data ? MongoDB is now available.
- The abe data type is too complicated for simple use cases, like getting data from other posts. here comes the abe type "collection". In one parameter, you get what you want.
- The documentation needs a huge improvement, we want something "a la Gatsby".
- You may deploy on any static host
- A bunch of micro-services is available (mail / form / search engine...)

# DISTRIBUTE
- You may distribute your content on your host, on Medium, on Linkedin, on Wordpress, on Drupal, by mail, ...
- You may plan the distribution

# ADVERTISE
- You can organize campaign of information automatically handled by our AI: The summaries are  created by the AI, sent on a smart schedule to the most efficient media for your content: Linkedin / Medium / Twitter.

# Measure
- AbeCMS uses GA to analyze your content efficiency
- AbeCMS uses also a specific tag to gather additional infos about your content
- AbeCMS uses also your creation steps info so that it can calculate the ROI of your content
- AbeCMS has a complete dashboard with all the stats available on the same page.


# The roadmap of AbeCMS CREATE

- ~~Remove dependencies from the core~~
- AbeCMS engine will be 100% based on Handlebars : The plan is to remove a max of regex. 
- We want to add one-way databinding to the core of Abe. As it's not the case with Handlebars, we will develop a library to make it possible. The outcome is huge: You'll be able to use AbeCMS in the browser, without the help of a server. Furthermore, making AbeCMS engine a one-way databinding lib is a first step toward vue.js or react.
- We want to remove all synchronous calls and make AbeCMS a 100% asynchronous stack, unleashing the NodeJS performance boost.
- AbeCMS Rest server is refactored to make it easy to use. It's now a first class citizen in the AbeCMS engine.
- ~~We've switched to CoreUI template (based on Bootstrap 4) for the back-office. We've worked on the user experience to make AbeCMS much more comfortable to use.~~
- remove openCV from the core and put the smartcrop feature as a plugin.
- components oriented
- ~~It is possible to create filtered views on the manager frontend~~
- since Abe has become stateful, clustering has been removed. Implement a solution to permit clusters of Abe
- Add template creation from partials
- templates and partials will be uploadable
- Video training will be produced
- Create an Electron version
- Refactor the REST layer: cf. https://github.com/Madmous/madClones/tree/develop/server/trello-microservice/src
  - Usage of oAuth2 for REST routes
- Add robots.txt + URL redirection features in Abe
- ~~A JSON document could be associated with more than 1 template: AMP template, mobile, template, instant article template, desktop template...~~
- We must be able to chose a theme (composed by templates) from the admin
- We should be able to sync data, templates, ... from a distant Abe install
- Add a -d (--dev) option to Abe CLI so that we can have livereload and debug features during template dev
- Feature : Global variables #262 opened on 1 Nov 2017 by NRAUBER 
- For S3 use default credentials instead #256 opened on 27 Oct 2017 by baptistemanson 
- 'abe-mailer' is not in the npm registry bug #254 opened on 23 Oct 2017 by vaughanwatson 
- express-session memory leak #250 opened on 20 Oct 2017 by roccomuso 
- abe-deployer-sftp #247 opened on 18 Oct 2017 by NRAUBER 
- ~~Special characters in password are not accepted bug #243 opened on 14 Oct 2017 by NRAUBER~~
- similar key between abe-each & abe-text bug #241 opened on 13 Oct 2017 by wonknu 
- search engine like following will be awesome.. #232 opened on 14 Aug 2017 by jkathir 
- The images doesn't move in the right item when I drag & drop bug #228 opened on 7 Aug 2017 by abderelmaftah 
- ~~activity stream on homepage is looping #219 opened on 29 May 2017 by opompilius~~
- max length not working on rich tag #211 opened on 27 Apr 2017 by mehdidjabri 
- symlink don't work when they are created with relative path bug #190 opened on 31 Mar 2017 by wonknu 
- WYSIWYG editor color bug #186 opened on 30 Mar 2017 by julienlegac 
- can't abe create name.io bug #183 opened on 28 Mar 2017 by gonzalezemmanuel 
- Server refactoring enhancement refactoring #180 opened on 25 Mar 2017 by gregorybesson 
- If I use an attribute "date" in a type=data, nothing does work anymore bug #127 opened on 30 Jan 2017 by gregorybesson  3.0.x
- Create a debug layer in Abe new feature #122 opened on 25 Jan 2017 by gregorybesson 
- Functions in select data enhancement #120 opened on 24 Jan 2017 by GG31 
- Partials included in severals templates with same values enhancement #119 opened on 19 Jan 2017 by GG31  3.0.x
- Allow select in json file new feature #109 opened on 5 Jan 2017 by catienza 
- Plugin system enhancement #107 opened on 4 Jan 2017 by opompilius 
- Browser does not scroll automatically to an editable zone in the preview bug #102 opened on 27 Dec 2016 by Roatha-Chann 
- Republish site has no effect on prefill datas enhancement #86 opened on 15 Dec 2016 by opompilius 
- ~~Refactor : put users database in /database/users.json refactoring #73 opened on 8 Dec 2016 by gregorybesson ~~
- New feature : migrations new feature #71 opened on 8 Dec 2016 by gregorybesson 
- Checkbox type new feature #64 opened on 2 Dec 2016 by GG31 
- Create a new attribute in abe data type: macro=true new feature #54 opened on 29 Nov 2016 by opompilius 
- {{#each}} - Title enhancement #36 opened on 21 Nov 2016 by julienlegac  3.0.x
- {{#each}} - Limit enhancement #118 opened on 19 Jan 2017 by GG31  3.0.x
- We want shortcuts for draft / publish ... enhancement #8 opened on 18 Oct 2016 by gregorybesson  3.0.x

