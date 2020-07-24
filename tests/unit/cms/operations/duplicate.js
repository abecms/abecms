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

  it('cmsOperations.duplicate()', async() => {
    // It sounds impossible to stub a function exported as default
    // sinon.stub(cmsOperations.create, 'default').resolves(fixture.jsonArticle)( (template, newPostUrl, json, user) => {
    //   return Promise.resolve(fixture.jsonArticle);
    // })
    sinon.stub(cmsOperations.post, 'draft').callsFake( () => {
      return Promise.resolve({json: JSON.parse(JSON.stringify(fixture.jsonArticle))})
    })
    sinon.stub(abeExtend.hooks.instance, 'trigger').callsFake( (str, obj, body, json) => {
      return str, obj;;
    })
    sinon.stub(Manager.instance, 'getList').callsFake( (str, obj) => {
      return [fixture.jsonArticle];
    })
    sinon.stub(coreUtils.slug, 'clean').callsFake( (p) => {
      return p;
    })
    sinon.stub(coreUtils.array, 'filter').callsFake( () => {
      return [fixture.jsonArticle];
    })
    sinon.stub(cmsData.file, 'get').callsFake( () => {
      return fixture.jsonArticle;
    })
    sinon.stub(cmsOperations.remove, 'remove').callsFake( () => {
      return null;
    })

    // test
    var newPostUrl = 'article-2.html'
    var resSave = await cmsOperations.duplicate('article-1.html', 'article', '', newPostUrl, {}, false)
    chai.expect(resSave.abe_meta).to.not.be.undefined;
    chai.expect(resSave.abe_meta.link).to.be.equal('/article-2.html');

    var resSave2 = await cmsOperations.duplicate('article-1.html', 'article', '', newPostUrl, {}, true)
    chai.expect(resSave2.abe_meta).to.not.be.undefined;
    chai.expect(resSave2.abe_meta.link).to.be.equal('/article-2.html');

    // unstub
    abeExtend.hooks.instance.trigger.restore()
    sinon.assert.callCount(Manager.instance.getList, 2)
    sinon.assert.callCount(coreUtils.slug.clean, 4)
    sinon.assert.callCount(coreUtils.array.filter, 2)
    sinon.assert.callCount(cmsOperations.post.draft, 2)
    sinon.assert.calledOnce(cmsOperations.remove.remove)
    sinon.restore()
  });
});
