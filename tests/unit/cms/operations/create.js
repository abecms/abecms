var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var abeExtend = require('../../../../src/cli').abeExtend
var cmsData = require('../../../../src/cli').cmsData
var Manager = require('../../../../src/cli').Manager
var coreUtils = require('../../../../src/cli').coreUtils
var cmsOperations = require('../../../../src/cli').cmsOperations
var cmsTemplates = require('../../../../src/cli').cmsTemplates
var Manager = require('../../../../src/cli').Manager;
var Page = require('../../../../src/cli').Page;

describe('cmsOperations', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          htmlArticle: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article.html'), 'utf8'),
          jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'files', 'article-2.json')),
          jsonHomepage: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'homepage-1.json'))
        }
        done()
        
      }.bind(this))
  });

  it('cmsOperations.create()', function(done) {
    // stub
    var s = sinon.sandbox.create();
    s.stub(abeExtend.hooks.instance, 'trigger', function (str, obj, body, json) {
      return str, obj;
    }.bind(this));
    s.stub(coreUtils.slug, 'clean', function (p) { return p; }.bind(this));
    s.stub(Manager.instance, 'postExist', function (p) { return false; }.bind(this));
    s.stub(cmsData.metas, 'create', function (json, template, postUrl) { return json; }.bind(this));
    s.stub(cmsTemplates.template, 'getTemplate', function () { return this.fixture.htmlArticle; }.bind(this));
    s.stub(cmsData.values, 'removeDuplicate', function (templateText, json) { return json; }.bind(this));
    s.stub(cmsOperations.post, 'draft', function () {
      return Promise.resolve({json: JSON.parse(JSON.stringify(this.fixture.jsonArticle))})
    }.bind(this));

    cmsOperations.create('article', '/article-2.html', JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
      .then(function(resSave) {
        var json = path.join(config.root, config.data.url, resSave.abe_meta.latest.abeUrl.replace('.html', '.json'))
        
        abeExtend.hooks.instance.trigger.restore()
        coreUtils.slug.clean.restore()
        Manager.instance.postExist.restore()
        cmsData.metas.create.restore()
        cmsTemplates.template.getTemplate.restore()
        cmsData.values.removeDuplicate.restore()
        cmsOperations.post.draft.restore()

        done()
      }.bind(this));
  });
});
