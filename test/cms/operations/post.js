var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test','fixtures')})

var abeExtend = require('../../../src/cli').abeExtend
var cmsData = require('../../../src/cli').cmsData
var Manager = require('../../../src/cli').Manager
var coreUtils = require('../../../src/cli').coreUtils
var cmsOperations = require('../../../src/cli').cmsOperations
var cmsTemplates = require('../../../src/cli').cmsTemplates
var Manager = require('../../../src/cli').Manager;
var Page = require('../../../src/cli').Page;

describe('cmsOperations', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          htmlArticle: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article.html'), 'utf8'),
          jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'test', 'fixtures', 'files', 'article-2.json')),
          jsonHomepage: fse.readJsonSync(path.join(process.cwd(), 'test', 'fixtures', 'data', 'homepage-1.json'))
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsOperations.post.publish
   * 
   */
  it('cmsOperations.post.publish()', function(done) {
    // stub
    var s = sinon.sandbox.create();
    s.stub(abeExtend.hooks.instance, 'trigger', function (str, obj) { return str, obj; }.bind(this));
    s.stub(cmsTemplates.template, 'getTemplate', function () { return this.fixture.htmlArticle; }.bind(this));
    s.stub(cmsData.source, 'getDataList', function () {
      return Promise.resolve(JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
    }.bind(this));
    s.stub(cmsData.utils, 'getPercentOfRequiredTagsFilled', function () { return 100; }.bind(this));
    // s.stub(Page, 'getPercentOfRequiredTagsFilled', function () { return 100; }.bind(this));
    s.stub(cmsOperations.save, 'saveHtml', function () { return 100; }.bind(this));
    s.stub(cmsOperations.save, 'saveJson', function () { return 100; }.bind(this));
    s.stub(Manager.instance, 'updatePostInList', function () { return null; }.bind(this));

    // test
    cmsOperations.post.publish('article-2.html', JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
      .then(function(resSave) {
      // unstub
      abeExtend.hooks.instance.trigger.restore()
      cmsTemplates.template.getTemplate.restore()
      cmsData.source.getDataList.restore()
      cmsData.utils.getPercentOfRequiredTagsFilled.restore()
      cmsOperations.save.saveHtml.restore()
      cmsOperations.save.saveJson.restore()
      Manager.instance.updatePostInList.restore()
      done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.unpublish
   * 
   */
  it('cmsOperations.post.unpublish()', function(done) {
    // stub
    var s = sinon.sandbox.create();
    s.stub(abeExtend.hooks.instance, 'trigger', function (str, obj) { return str, obj; }.bind(this));
    s.stub(coreUtils.file, 'exist', function (revisionPath) { return true; }.bind(this));
    s.stub(cmsData.file, 'get', function () { return JSON.parse(JSON.stringify(this.fixture.jsonArticle)); }.bind(this));
    s.stub(cmsOperations.post, 'draft', function () {
      return Promise.resolve({json: JSON.parse(JSON.stringify(this.fixture.jsonArticle))})
    }.bind(this));
    s.stub(cmsOperations.remove, 'removeFile', function () { return null; }.bind(this));
    s.stub(Manager.instance, 'updatePostInList', function () { return null; }.bind(this));

    // test
    cmsOperations.post.unpublish('article-2.html')
    .then(function(resSave) {
      
      // unstub
      abeExtend.hooks.instance.trigger.restore()
      coreUtils.file.exist.restore()
      cmsData.file.get.restore()
      cmsOperations.post.draft.restore()
      cmsOperations.remove.removeFile.restore()
      Manager.instance.updatePostInList.restore()
      done()
    }.bind(this));
  });

  /**
   * cmsOperations.post.draft
   * 
   */
  it('cmsOperations.post.draft()', function(done) {
    var json = JSON.parse(JSON.stringify(this.fixture.jsonArticle))
    var meta = json.abe_meta
    delete json.abe_meta

    // stub
    var s = sinon.sandbox.create();
    s.stub(abeExtend.hooks.instance, 'trigger', function (str, obj) { return str, obj; }.bind(this));
    s.stub(coreUtils.file, 'addDateIsoToRevisionPath', function (revisionPath) { return revisionPath; }.bind(this));
    s.stub(cmsData.metas, 'add', function (json) {
      json.abe_meta = meta
      return json;
    }.bind(this));
    s.stub(cmsTemplates.template, 'getTemplate', function () { return this.fixture.htmlArticle; }.bind(this));
    s.stub(cmsData.source, 'getDataList', function () {
      return Promise.resolve(JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
    }.bind(this));
    s.stub(cmsOperations.save, 'saveJson', function () { return true; }.bind(this));
    s.stub(Manager.instance, 'updatePostInList', function () { return null; }.bind(this));
    s.stub(cmsData.utils, 'getPercentOfRequiredTagsFilled', function () { return 100; }.bind(this));

    // test
    cmsOperations.post.draft('article-2.html', JSON.parse(JSON.stringify(this.fixture.jsonArticle)))
      .then(function(resSave) {
        chai.expect(resSave.success).to.be.equal(1);
        chai.expect(resSave.json.abe_meta).to.not.be.undefined;
        
        // unstub
        abeExtend.hooks.instance.trigger.restore()
        coreUtils.file.addDateIsoToRevisionPath.restore()
        cmsData.utils.getPercentOfRequiredTagsFilled.restore()
        cmsData.metas.add.restore()
        cmsTemplates.template.getTemplate.restore()
        cmsData.source.getDataList.restore()
        cmsOperations.save.saveJson.restore()
        Manager.instance.updatePostInList.restore()

        done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.submit
   * 
   */
  it('cmsOperations.post.submit()', function(done) {
    // stub
    var s = sinon.sandbox.create();
    s.stub(cmsOperations.post, 'draft', function (filePath, json, rejectToWorkflow) {
      return Promise.resolve({
          success: 1,
          json: this.fixture.jsonArticle
        });
    }.bind(this));

    // test
    var json = JSON.parse(JSON.stringify(this.fixture.jsonArticle))
    json.abe_meta.status = 'publish'
    cmsOperations.post.submit('article-2.html', json)
      .then(function(resSave) {
        chai.expect(resSave.json.abe_meta).to.not.be.undefined;

        // unstub
        cmsOperations.post.draft.restore()
        done()
      }.bind(this));
  });

  /**
   * cmsOperations.post.reject
   * 
   */
  it('cmsOperations.post.reject()', function(done) {
    // stub
    var s = sinon.sandbox.create();
    s.stub(abeExtend.hooks.instance, 'trigger', function (str, obj) { return str, obj; }.bind(this));
    s.stub(cmsOperations.post, 'draft', function (filePath, json, rejectToWorkflow) {
      chai.expect(rejectToWorkflow).to.be.equal("draft");
      return Promise.resolve(this.fixture.jsonArticle);
    }.bind(this));

    // test
    var json = JSON.parse(JSON.stringify(this.fixture.jsonArticle))
    json.abe_meta.status = 'publish'
    cmsOperations.post.reject('article-2.html', json)
      .then(function(resSave) {
        chai.expect(resSave.abe_meta).to.not.be.undefined;

        // unstub
        abeExtend.hooks.instance.trigger.restore()
        cmsOperations.post.draft.restore()
        done()
      }.bind(this));
  });
});
