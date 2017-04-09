We have a 1 year roadmap (estimation) with the following versions. You'll notice that as we're developing in agile mode, we've chosen to create and present groups of features but no date of delivery (feature-driven release planning : http://www.scrum-institute.org/Release_Planning.php). This roadmap doesn't take into account the bugs which could be opened during this timeframe. Depending on the severity of these bugs, we'll be able to fix shortly after their discovery and include those fixes in specific Hotfix versions or include these bugs in the roadmap.

The 2.x releases have been focused on quality and stability and covered by Unit tests + functional tests.

The 3.x releases will focus on the REST layer of AbeCMS.

## Roadmap of the next 3.x releases
- It will be possible to create filtered views on the manager frontend
- since Abe has become stateful, clustering has been removed. Implement a solution to permit clusters of Abe
- Add template creation from partials
- templates and partials will be uploadable
- Video training will be produced
- Create an Electron version
- Refactor the REST layer:
  - Usage of oAuth2 for REST routes
- Add robots.txt + URL redirection features in Abe
- A JSON document could be associated with more than 1 template: AMP template, mobile, template, instant article template, desktop template...
- We must be able to chose a theme (composed by templates) from the admin
- We should be able to sync data, templates, ... from a distant Abe install
- Let's improve the republish-all so that we boost the performance.

## Changelog
See the complete [changelog](./CHANGELOG.md)

### 3.0.0
See the complete [v3.0.0 release notes](./version3.md)

### 2.16.*

### 2.15.*
- The order by statement in abe type="data" is now fully usable on any property of the json post. usage of order by date ASC is deprecated. Please use order by abe_meta.date ASC instead. And you can now limit a set of record without having to use the 'where' statement
- abe type="import" are not usable in a {{#each}} statement for technical reasons. But you can reproduce this behavior by using the array notation in an import. ie. {{abe type="import" file="myPartial/{{list[].id}}"}} This is particularly useful when you propose a contributor to select several partials in a list (with the {{#each}} notation + type="data). You can then display these selected partials with this iarray style notation.

### 2.14.*
- Abe type="data" are now usable in {{#each x}} statements. This was a long awaited feature.

### 2.13.*
- The manager has been fully ajaxified ; A dedicated REST route is available making the performance on frontend much more performant. the stateful manager of Abe has become responsible of pagination of articles (huge performance boost)
- New core features for the array class (facet + nested sort)

### 2.12.*
- 150 handlebars helpers are now available for template designers
- The engine now detects abe tags with more accuracy and more performance
- The abe type="file" is available (your users will be able to upload files
- The "hint" attribute (which produces a comment under the fields in the editor) are now part of the core
- The load testing scenarii have been open sourced (based on Locust)

### 2.11.*
- Abe type="import": Can now include variables
- Abe admin: Role Workflow management has been improved
- Functional tests are now available !
- Unit testing covers more than 60% of the code :)

### 2.10.*
- Template designer : isEditor variable can be used in a template
- Bugfixes

### 2.9.*
- Only bugfixes concerning User management

### 2.8.*
- New plugin system for Abe. It's now based on npm !
- Integrating user authentication and authorization Management inside Abe !
- Integrating Image cropping and resizing into Abe !
- Improving Unit tests

### 2.7.*
- New statement in Abe type="data": the display attribute can contain multiple variables (useful when used with autocomplete feature)

### 2.6.*
- Template designer: Precontrib is available for template designers. It will be possible to define specific slug structure from a template.
- Template designer: 2 new handlebars helpers. uppercase and lowercase
- Reference files editor available on admin !
- Manager: On publish and unpublish, we only add/update or remove the concerned file. Huge performance improvement on save steps !
- Dev: It's now possible to dev Abe under Windows

### 2.5.*
- New statement in Abe type="data" AQL format: A select may now contain "IN" or "NOT IN" with variables usage (you can reference another data type).
- New attribute in Abe type="data": prefill gives the possibility on the editor to "refill" fields already filled in.
- Adding unit tests
- New command: generate-posts.js giving you the possibility to export data from Abe on the command line
- The Abe editor is now compatible with Firefox

### 2.4.*
- The first unit tests are implemented
- Quality control with esLint added
- Continuous Integration with [Travis](https://travis-ci.org/abecms/abecms)
- Unit test coverage added : [coveralls](https://coveralls.io/github/abecms/abecms?branch=master)
- Select data become a first class citizen in Manager => perf X50 on page display including templates with select statements

### 2.3.*
- don't block response when upload image file size reaches a predefined limit
- allow video upload
- New handlebars helper : isTrue() (cf. doc)
- Replacing `Sql.deep_value_array` with `eval` in abe-sql.js resulting in a performance boost on request calculation
- precompilation of templates added as configurable option resulting in a performance boost on page display
- Removing pagination option from Abe

### 2.2.*
- ExecuteQuery becomes asynchronous

### 2.1
- New handlebars helper : truncate() (cf. doc)

### 2.0
- The plugins have been put in their respective repository. It's now possible to install plugins directly from Abe config file and command `abe install`.
- Abe becomes a stateful app. A manager is created to handle the file list which is updated on events (CRUD) resulting in a major boost of performance.

### 1.8.x
This version will be the last in the 1.x series.
- Performance improvements: The overall performance of Abe has been optimized. The "Order By" statement in select statement ine the type="data" has been deeply improved. Furthermore, the front was requesting twice the same content (to populate left and main content). It has been fixed. 

### 1.7.x
New features :
- Duplicate : It's now possible to create a new content form an existing one.
- Routes refactoring : Each action sent to the Abe engine has its own route
- Routes refactoring : A new route /list-url display the whole list of available routes exposed by Abe
- Routes refactoring : publish-all is a new route triggering the republication of all already published content without modifying the modification date oif these contents. This is the first attempt to address the possibility of updating linked content when publishing a content.
- Content metadata updatable : It's now possible to change the path, the name or the template of an existing file
- Debugging : It's now possible to trigger logs by adding a parameter in the url
