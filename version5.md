# AbeCMS version 5.x

# Introduction

Here comes the version 5, at last. A much cleaner back-office and many new features to make static website creation easier.

This CMS aims to become a full featured CMS made for frontend devs : No back-office to create, no complex data structure nor database to handle.
Everything is made progressive to give you what you need at the right time.

## Roadmap of the next 5.x releases

# Plan
- A trello like to plan, schedule and assign tickets to create content
- A calendar view
- Notifications insite

# Create
- Abify an html from the command line
- Create a full featured documentation

# Deploy
- Add netlify as a static deployment stack
- add micro-services (mail / form / search engine...)
- Manage summaries post of content + Linkedin, Medium, Twitter, ...

# Measure
- Add an Abe tag to measure infos
- GA
- Get infos while content creation
- Full dashboard to present measures

## BUGS / Refactor
- Essayer de rendre la synchro form / content dans l'éditeur dynamique (à la react) => cf abecms4research
- components oriented
- since Abe has become stateful, clustering has been removed. Implement a solution to permit clusters of Abe
- add the date field
- templates and partials will be uploadable
- Video training will be produced
- Refactor the REST layer: cf. https://github.com/Madmous/madClones/tree/develop/server/trello-microservice/src
- Usage of oAuth2 for REST routes
- Add robots.txt + URL redirection features in Abe
- We must be able to chose a theme (composed by templates) from the admin
- We should be able to sync data, templates, ... from a distant Abe install
- Add a -d (--dev) option to Abe CLI so that we can have livereload and debug features during template dev
- For S3 use default credentials instead #256 opened on 27 Oct 2017 by baptistemanson
- 'abe-mailer' is not in the npm registry bug #254 opened on 23 Oct 2017 by vaughanwatson
- abe-deployer-sftp #247 opened on 18 Oct 2017 by NRAUBER
- Special characters in password are not accepted bug #243 opened on 14 Oct 2017 by NRAUBER
- similar key between abe-each & abe-text bug #241 opened on 13 Oct 2017 by wonknu
- search engine like following will be awesome.. #232 opened on 14 Aug 2017 by jkathir
- The images doesn't move in the right item when I drag & drop bug #228 opened on 7 Aug 2017 by abderelmaftah
- max length not working on rich tag #211 opened on 27 Apr 2017 by mehdidjabri
- symlink don't work when they are created with relative path bug #190 opened on 31 Mar 2017 by wonknu
- WYSIWYG editor color bug #186 opened on 30 Mar 2017 by julienlegac
- can't abe create name.io bug #183 opened on 28 Mar 2017 by gonzalezemmanuel
- Server refactoring enhancement refactoring #180 opened on 25 Mar 2017 by gregorybesson
- If I use an attribute "date" in a type=data, nothing does work anymore bug #127 opened on 30 Jan 2017 by gregorybesson  3.0.x
- Create a debug layer in Abe new feature #122 opened on 25 Jan 2017 by gregorybesson
- Functions in select data enhancement #120 opened on 24 Jan 2017 by GG31
- {{#each}} - with limit enhancement #118 opened on 19 Jan 2017 by GG31  3.0.x
- {{#each}} - Title enhancement #36 opened on 21 Nov 2016 by julienlegac  3.0.x
- Allow select in json file new feature #109 opened on 5 Jan 2017 by catienza
- Plugin system enhancement #107 opened on 4 Jan 2017 by opompilius   1
- Browser does not scroll automatically to an editable zone in the preview bug #102 opened on 27 Dec 2016 by Roatha-Chann
- Republish site has no effect on prefill datas enhancement #86 opened on 15 Dec 2016 by opompilius
- New feature : migrations new feature #71 opened on 8 Dec 2016 by gregorybesson
- Checkbox type new feature #64 opened on 2 Dec 2016 by GG31
- Create a new attribute in abe data type: macro=true new feature #54 opened on 29 Nov 2016 by opompilius
- We want shortcuts for draft / publish ... enhancement #8 opened on 18 Oct 2016 by gregorybesson  3.0.x

