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

  /**
   * cmsOperations.post.publish
   * 
   */
  it('cmsOperations.post.publish()', function(done) {
    sinon.stub(abeExtend.hooks.instance, 'trigger').callsFake((str, obj) => { return str, obj; });
    sinon.stub(cmsTemplates.template, 'getTemplate').callsFake(() => { return fixture.htmlArticle; });
    sinon.stub(cmsData.source, 'updateJsonWithExternalData').callsFake( () => {
      return Promise.resolve(JSON.parse(JSON.stringify(fixture.jsonArticle)))
    });
    sinon.stub(cmsData.utils, 'getPercentOfRequiredTagsFilled').callsFake( () => { return 100; });
    sinon.stub(cmsOperations.save, 'saveHtml').callsFake( () => { return 100; });
    sinon.stub(cmsOperations.save, 'saveJson').callsFake( () => { return 100; });
    sinon.stub(Manager.instance, 'updatePostInList').callsFake( () => { return null; });

    // test
    cmsOperations.post.publish('article-2.html', JSON.parse(JSON.stringify(fixture.jsonArticle)))
      .then(function(resSave) {
      sinon.restore()
      done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.unpublish
   * 
   */
  it('cmsOperations.post.unpublish()', function(done) {
    sinon.stub(abeExtend.hooks.instance, 'trigger').callsFake( (str, obj) => { return str, obj; });
    sinon.stub(coreUtils.file, 'exist').callsFake( (revisionPath) => { return true; });
    sinon.stub(cmsData.file, 'get').callsFake( () => { return JSON.parse(JSON.stringify(fixture.jsonArticle)); });
    sinon.stub(cmsOperations.post, 'draft').callsFake( () => {
      return Promise.resolve({json: JSON.parse(JSON.stringify(fixture.jsonArticle))})
    });
    sinon.stub(cmsOperations.remove, 'removeRevision').callsFake( () => { return null; });
    sinon.stub(cmsOperations.remove, 'removePost').callsFake( () => { return null; });
    sinon.stub(Manager.instance, 'updatePostInList').callsFake( () => { return null; });

    // test
    cmsOperations.post.unpublish('article-2.html')
    .then(function(resSave) {

      sinon.restore()
      done()
    }.bind(this));
  });

  /**
   * cmsOperations.post.draft
   * 
   */
  it('cmsOperations.post.draft()', function(done) {
    var json = JSON.parse(JSON.stringify(fixture.jsonArticle))
    var meta = json.abe_meta
    delete json.abe_meta

    sinon.stub(abeExtend.hooks.instance, 'trigger').callsFake( (str, obj) => { return str, obj; });
    sinon.stub(coreUtils.file, 'addDateIsoToRevisionPath').callsFake( (revisionPath) => { return revisionPath; });
    sinon.stub(cmsData.metas, 'add').callsFake( (json) => {
      json.abe_meta = meta
      return json;
    });
    sinon.stub(cmsTemplates.template, 'getTemplate').callsFake( () => { return fixture.htmlArticle; });
    sinon.stub(cmsData.source, 'updateJsonWithExternalData').callsFake( () => {
      return Promise.resolve(JSON.parse(JSON.stringify(fixture.jsonArticle)))
    });
    sinon.stub(cmsOperations.save, 'saveJson').callsFake( () => { return true; });
    sinon.stub(Manager.instance, 'updatePostInList').callsFake( () => { return null; });
    sinon.stub(cmsData.utils, 'getPercentOfRequiredTagsFilled').callsFake( () => { return 100; });

    // test
    cmsOperations.post.draft('article-2.html', JSON.parse(JSON.stringify(fixture.jsonArticle)))
      .then(function(resSave) {
        chai.expect(resSave.success).to.be.equal(1);
        chai.expect(resSave.json.abe_meta).to.not.be.undefined;
        
        sinon.restore()

        done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.submit
   * 
   */
  it('cmsOperations.post.submit()', function(done) {
    sinon.stub(cmsOperations.post, 'draft').callsFake( (filePath, json, rejectToWorkflow) => {
      return Promise.resolve({
          success: 1,
          json: fixture.jsonArticle
        });
    });

    // test
    var json = JSON.parse(JSON.stringify(fixture.jsonArticle))
    json.abe_meta.status = 'publish'
    cmsOperations.post.submit('article-2.html', json)
      .then(function(resSave) {
        chai.expect(resSave.json.abe_meta).to.not.be.undefined;

        // unstub
        sinon.restore()
        done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.reject
   * 
   */
  it('cmsOperations.post.reject()', function(done) {
    sinon.stub(abeExtend.hooks.instance, 'trigger').callsFake( (str, obj) => { return str, obj; });
    sinon.stub(cmsOperations.post, 'draft').callsFake( (filePath, json, rejectToWorkflow) => {
      chai.expect(rejectToWorkflow).to.be.equal("draft");
      return Promise.resolve(fixture.jsonArticle);
    });

    // test
    var json = JSON.parse(JSON.stringify(fixture.jsonArticle))
    json.abe_meta.status = 'publish'
    cmsOperations.post.reject('article-2.html', json)
      .then(function(resSave) {
        chai.expect(resSave.abe_meta).to.not.be.undefined;

        // unstub
        sinon.restore()
        done()
      }.bind(this));
  });
});
