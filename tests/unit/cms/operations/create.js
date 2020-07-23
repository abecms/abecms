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
  let fixture
  before(async () => {
    await Manager.instance.init()
    Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
    await Manager.instance.updateList()

    fixture = {
      htmlArticle: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article.html'), 'utf8'),
      jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'files', 'article-2.json')),
      jsonHomepage: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'homepage-1.json'))
    }
  })

  it('cmsOperations.create()', function(done) {
    sinon.stub(abeExtend.hooks.instance, 'trigger').callsFake( (str, obj, body, json) => {
      return str, obj;;
    })
    sinon.stub(coreUtils.slug, 'clean').callsFake( (p) => {
      return p;
    })
    sinon.stub(Manager.instance, 'postExist').callsFake( (p) => {
      return false;
    })
    sinon.stub(cmsData.metas, 'create').callsFake( (json, template, postUrl) => {
      return json;
    })
    sinon.stub(cmsTemplates.template, 'getTemplate').callsFake( () => {
      return fixture.htmlArticle;
    })
    sinon.stub(cmsData.values, 'removeDuplicate').callsFake( (templateText, json) => {
      return json;
    })
    sinon.stub(cmsOperations.post, 'draft').callsFake( () => {
      return Promise.resolve({json: JSON.parse(JSON.stringify(fixture.jsonArticle))})
    })

    cmsOperations.create('article', '/article-2.html', JSON.parse(JSON.stringify(fixture.jsonArticle)))
      .then(function(resSave) {
        var json = path.join(Manager.instance.pathData, resSave.abe_meta.latest.abeUrl.replace('.html', '.json'))
        
        abeExtend.hooks.instance.trigger.restore()
        coreUtils.slug.clean.restore()
        Manager.instance.postExist.restore()
        cmsData.metas.create.restore()
        cmsTemplates.template.getTemplate.restore()
        cmsData.values.removeDuplicate.restore()
        cmsOperations.post.draft.restore()
        sinon.restore()

        done()
      }.bind(this));
  });
});
