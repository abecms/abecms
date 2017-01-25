var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var abeExtend = require('../../../src/cli').abeExtend;
var cmsData = require('../../../src/cli').cmsData;
var cmsTemplates = require('../../../src/cli').cmsTemplates;
var coreUtils = require('../../../src/cli').coreUtils;
var Manager = require('../../../src/cli').Manager;

describe('cmsTemplates', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          slug: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'slug.html'), 'utf-8'),
          article: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article.html'), 'utf-8'),
          local: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'local.html'), 'utf-8'),
          articleSingleAbe: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article-single-abe.html'), 'utf-8'),
          articleRequest: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article-request.html'), 'utf-8'),
          template: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'import.html'), 'utf-8'),
          articleEach: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article-each-abe.html'), 'utf-8'),
          articlePrecontrib: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article-precontribution.html'), 'utf-8'),
          templateKeys: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article-keys.html'), 'utf-8'),
          templatePaths: path.join(process.cwd(), 'test', 'fixtures', 'templates', 'templates/article.html'),
          structurePaths: path.join(process.cwd(), 'test', 'fixtures', 'templates', 'templates/structure/0-1'),
          import: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'import.html'), 'utf-8'),
          pathTemplates: path.join(process.cwd(), 'test', 'fixtures', 'templates'),
          pathPartials: path.join(process.cwd(), 'test', 'fixtures', 'partials'),
          count: 0
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsTemplates.template.getTemplatesAndPartials
   * 
   */
  it('cmsTemplates.template.getTemplatesAndPartials()', function(done) {

    cmsTemplates.template.getTemplatesAndPartials(this.fixture.pathTemplates, this.fixture.pathPartials)
    .then((templatesList) => {
      chai.expect(templatesList.length).to.be.equal(29);
      done()
    })
  });

  /**
   * 
   * 
   */
  it('cmsTemplates.template.addOrder()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var getAttr = sinonInstance.stub(cmsData.regex, 'getAttr');
    getAttr.returns(null)

    // test
    var html = cmsTemplates.template.addOrder(this.fixture.articleSingleAbe)
    chai.expect(html).to.not.be.equal(this.fixture.articleSingleAbe);
    chai.expect(html.indexOf('order')).to.above(-1);

    // unstub
    sinon.assert.calledOnce(cmsData.regex.getAttr)
    cmsData.regex.getAttr.restore()
  });

  /**
   * cmsTemplates.template.getStructureAndTemplates
   * 
   */
  it('cmsTemplates.template.getStructureAndTemplates()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubGetFoldersSync = sinonInstance.stub(coreUtils.file, 'getFoldersSync');
    stubGetFoldersSync.returns({path: this.fixture.structurePaths, folders: []})
    var stubGetFilesSync = sinonInstance.stub(coreUtils.file, 'getFilesSync');
    stubGetFilesSync.returns([this.fixture.templatePaths])

    // test
    var res = cmsTemplates.template.getStructureAndTemplates()
    chai.expect(res.templates.length).to.be.equal(1);

    // unstub
    sinon.assert.calledOnce(coreUtils.file.getFoldersSync)
    coreUtils.file.getFoldersSync.restore()
    sinon.assert.calledOnce(coreUtils.file.getFilesSync)
    coreUtils.file.getFilesSync.restore()
  });

  /**
   * getAbeImport
   * 
   */
  it('cmsTemplates.template.getAbeImport()', function() {
    var res = cmsTemplates.template.getAbeImport(this.fixture.template)
    chai.expect(res).to.have.length(1);
  });

  /**
   * translate
   * 
   */
  it('cmsTemplates.template.translate()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var getAttr = sinonInstance.stub(cmsData.regex, 'getAttr', function (math, type) {
      if (type === 'locale') {
        return 'gb'
      }
      if (type === 'source') {
        return 'test'
      }
    });
    var escapeTextToRegex = sinonInstance.stub(cmsData.regex, 'escapeTextToRegex');
    escapeTextToRegex.returns(new RegExp(this.fixture.local, 'g'))

    // test
    var res = cmsTemplates.template.translate(this.fixture.local)
    chai.expect(res.indexOf('i18nAbe')).to.above(-1);

    // unstub
    cmsData.regex.getAttr.restore()
    sinon.assert.calledOnce(cmsData.regex.escapeTextToRegex)
    cmsData.regex.escapeTextToRegex.restore()
  });

  /**
   * getVariablesInWhere
   * 
   */
  it('cmsTemplates.template.getVariablesInWhere()', function() {
    // stub

    // test
    var res = cmsTemplates.template.getVariablesInWhere({left: {column: 'title'}, right: {value: "test"}, operator: 'AND'})
    chai.expect(res.length).to.above(-1);

    // unstub
  });

  /**
   * recurseWhereVariables
   * 
   */
  it('cmsTemplates.template.recurseWhereVariables()', function() {
    // stub

    // test
    var res = cmsTemplates.template.recurseWhereVariables({left: {column: 'title'}, right: {value: "test"}})
    chai.expect(res.length).to.above(-1);

    // unstub
  });

  /**
   * getTemplatesTexts
   * 
   */
  it('cmsTemplates.template.getTemplatesTexts()', function(done) {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var readFileSync = sinonInstance.stub(fse, 'readFileSync');
    readFileSync.returns("test")

    // test
    cmsTemplates.template.getTemplatesTexts(['test'])
    .then(function (res) {
      chai.expect(res[0].name).to.be.equal('test');

      // unstub
      sinon.assert.calledOnce(fse.readFileSync)
      fse.readFileSync.restore()
      done()
    })
  });

  /**
   * includePartials
   * 
   */
  it('cmsTemplates.template.includePartials()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubReadFileSync = sinonInstance.stub(fse, 'readFileSync');
    stubReadFileSync.returns("test")
    var stubGetAbeImport = sinonInstance.stub(cmsTemplates.template, 'getAbeImport', function () {
      if (this.fixture.count === 0) {
        this.fixture.count++
        return [this.fixture.import]
      }
      return []
    }.bind(this));
    var stubGetAll = sinonInstance.stub(cmsData.attributes, 'getAll');
    stubGetAll.returns({file: 'import.html'})
    var stubEscapeTextToRegex = sinonInstance.stub(cmsData.regex, 'escapeTextToRegex');
    stubEscapeTextToRegex.returns(new RegExp(this.fixture.import, 'g'))
    var stubFile = sinonInstance.stub(coreUtils.file, 'exist', function () {
      return true
    }.bind(this));

    // test
    var template = cmsTemplates.template.includePartials(this.fixture.template)
    chai.expect(template).to.be.equal("test");

    // unstub
    sinon.assert.calledOnce(fse.readFileSync)
    fse.readFileSync.restore()
    sinon.assert.calledTwice(cmsTemplates.template.getAbeImport)
    cmsTemplates.template.getAbeImport.restore()
    sinon.assert.calledOnce(cmsData.attributes.getAll)
    cmsData.attributes.getAll.restore()
    sinon.assert.calledOnce(coreUtils.file.exist)
    coreUtils.file.exist.restore()
    sinon.assert.calledOnce(cmsData.regex.escapeTextToRegex)
    cmsData.regex.escapeTextToRegex.restore()
  });

  it('cmsTemplates.template.includePartials()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubReadFileSync = sinonInstance.stub(fse, 'readFileSync');
    stubReadFileSync.returns("test")

    var template = cmsTemplates.template.includePartials("{{abe type='import' file='{{test}}'}}", {"test" : "test.html"})
    fse.readFileSync.restore()
    chai.expect(template).to.be.equal("test")
  });

  it('cmsTemplates.template.includePartials() with []', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubReadFileSync = sinonInstance.stub(fse, 'readFileSync');
    stubReadFileSync.withArgs(path.join(config.root, config.partials, 'test.html')).returns('test');
    stubReadFileSync.withArgs(path.join(config.root, config.partials, 'title.html')).returns('title');

    var template = cmsTemplates.template.includePartials("{{abe type='import' file='{{test[].value}}'}}", {"test" : [{"value":"test.html"}, {"value":"title.html"}]})
    fse.readFileSync.restore()
    chai.expect(template).to.be.equal("testtitle")
  });

  /**
   * cmsTemplates.template.getTemplate
   * 
   */
  it('cmsTemplates.template.getTemplate()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubReadFileSync = sinonInstance.stub(fse, 'readFileSync');
    stubReadFileSync.returns(this.fixture.article)
    var stubTrigger = sinonInstance.stub(abeExtend.hooks.instance, 'trigger', function (p1, p2) {
      return p2
    })
    var stubExist = sinonInstance.stub(coreUtils.file, 'exist');
    stubExist.returns(true)
    var stubIncludePartials = sinonInstance.stub(cmsTemplates.template, 'includePartials');
    stubIncludePartials.returns(this.fixture.article)
    var stubTranslate = sinonInstance.stub(cmsTemplates.template, 'translate');
    stubTranslate.returns(this.fixture.article)
    var stubAddOrder = sinonInstance.stub(cmsTemplates.template, 'addOrder');
    stubAddOrder.returns(this.fixture.article)

    var template = cmsTemplates.template.getTemplate('article')
    chai.expect(template).to.be.equal(this.fixture.article);

    sinon.assert.calledOnce(fse.readFileSync)
    fse.readFileSync.restore()
    sinon.assert.calledTwice(abeExtend.hooks.instance.trigger)
    abeExtend.hooks.instance.trigger.restore()
    sinon.assert.calledOnce(coreUtils.file.exist)
    coreUtils.file.exist.restore()
    sinon.assert.calledOnce(cmsTemplates.template.includePartials)
    cmsTemplates.template.includePartials.restore()
    sinon.assert.calledOnce(cmsTemplates.template.translate)
    cmsTemplates.template.translate.restore()
    sinon.assert.calledOnce(cmsTemplates.template.addOrder)
    cmsTemplates.template.addOrder.restore()
  });

  /**
   * cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist
   * 
   */
  it('cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubGetTagAbeWithType = sinonInstance.stub(cmsData.regex, 'getTagAbeWithType');
    stubGetTagAbeWithType.returns(null)

    // test
    var text = cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist(this.fixture.slug)
    chai.expect(text).to.not.be.equal(this.fixture.slug);

    // unstub
    sinon.assert.calledOnce(cmsData.regex.getTagAbeWithType)
    cmsData.regex.getTagAbeWithType.restore()
  });

  /**
   * cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist
   * 
   */
  it('cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubGetTagAbeWithTab = sinonInstance.stub(cmsData.regex, 'getTagAbeWithTab');
    stubGetTagAbeWithTab.returns(null)

    // test
    var text = cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist(this.fixture.slug)
    chai.expect(text).to.not.be.equal(this.fixture.slug);

    // unstub
    sinon.assert.calledOnce(cmsData.regex.getTagAbeWithTab)
    cmsData.regex.getTagAbeWithTab.restore()
  });

  /**
   * cmsTemplates.template.getAbePrecontribFromTemplates
   * 
   */
  it('cmsTemplates.template.getAbePrecontribFromTemplates()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubGetTagAbeWithTab = sinonInstance.stub(cmsData.regex, 'getTagAbeWithTab');
    stubGetTagAbeWithTab.returns(['{{abe type="slug" source="{{name}}"}}'])

    var stubGetAll = sinonInstance.stub(cmsData.attributes, 'getAll');
    stubGetAll.returns({name: 'test.html'})

    var stubAddOrder = sinonInstance.stub(cmsTemplates.template, 'addOrder', function (text) {
      return text
    });

    // test
    var precontrib = cmsTemplates.template.getAbePrecontribFromTemplates([{name: 'slug', template: this.fixture.slug}])
    chai.expect(precontrib.fields[0]).to.not.be.undefined;

    // unstub
    sinon.assert.calledOnce(cmsData.regex.getTagAbeWithTab)
    cmsData.regex.getTagAbeWithTab.restore()
    sinon.assert.calledOnce(cmsData.attributes.getAll)
    cmsData.attributes.getAll.restore()
    sinon.assert.calledOnce(cmsTemplates.template.addOrder)
    cmsTemplates.template.addOrder.restore()
  });

  /**
   * cmsTemplates.template.getAbeSlugFromTemplates
   * 
   */
  it('cmsTemplates.template.getAbeSlugFromTemplates()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var setAbeSlugDefaultValueIfDoesntExist = sinonInstance.stub(cmsTemplates.template, 'setAbeSlugDefaultValueIfDoesntExist');
    setAbeSlugDefaultValueIfDoesntExist.returns(this.fixture.slug)
    var getTagAbeWithType = sinonInstance.stub(cmsData.regex, 'getTagAbeWithType');
    getTagAbeWithType.returns(['{{abe type="slug" source="{{name}}"}}'])
    var getAll = sinonInstance.stub(cmsData.attributes, 'getAll');
    getAll.returns({sourceString: 'test.html', name: 'test'})

    var slug = cmsTemplates.template.getAbeSlugFromTemplates([{name: 'slug', template: this.fixture.slug}])
    chai.expect(slug.slug).to.not.be.undefined;

    // unstub
    sinon.assert.calledOnce(cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist)
    cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist.restore()
    sinon.assert.calledOnce(cmsData.regex.getTagAbeWithType)
    cmsData.regex.getTagAbeWithType.restore()
    sinon.assert.calledOnce(cmsData.attributes.getAll)
    cmsData.attributes.getAll.restore()
  });

  /**
   * getTemplate
   * 
   */
  it('cmsTemplates.template.execRequestColumns()', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var getTagAbeTypeRequest = sinonInstance.stub(cmsData.regex, 'getTagAbeTypeRequest');
    getTagAbeTypeRequest.returns([this.fixture.articleRequest])
    var getSourceType = sinonInstance.stub(cmsData.sql, 'getSourceType');
    getSourceType.returns('request')
    var handleSqlRequest = sinonInstance.stub(cmsData.sql, 'handleSqlRequest');
    handleSqlRequest.returns({columns: ['title'], where: {left: 'title'}})
    var recurseWhereVariables = sinonInstance.stub(cmsTemplates.template, 'recurseWhereVariables');
    recurseWhereVariables.returns('title2')

    // test
    const pathTemplate = path.join(config.root, config.templates.url)
    var ar = cmsTemplates.template.execRequestColumns(this.fixture.templateKeys)
    chai.expect(ar.indexOf('title')).to.be.above(-1);

    // unstub
    sinon.assert.calledOnce(cmsData.regex.getTagAbeTypeRequest)
    cmsData.regex.getTagAbeTypeRequest.restore()
    sinon.assert.calledOnce(cmsData.sql.getSourceType)
    cmsData.sql.getSourceType.restore()
    sinon.assert.calledOnce(cmsData.sql.handleSqlRequest)
    cmsData.sql.handleSqlRequest.restore()
    sinon.assert.calledOnce(cmsTemplates.template.recurseWhereVariables)
    cmsTemplates.template.recurseWhereVariables.restore()
  });

  /**
   * getTemplate
   * 
   */
  it('cmsTemplates.template.getAbeRequestWhereKeysFromTemplates()', function(done) {
    // stub
    var sinonInstance = sinon.sandbox.create();
    var execRequestColumns = sinonInstance.stub(cmsTemplates.template, 'execRequestColumns');
    execRequestColumns.returns(['title'])

    // test
    const pathTemplate = path.join(config.root, config.templates.url)
    cmsTemplates.template.getAbeRequestWhereKeysFromTemplates([this.fixture.articleRequest])
    .then(function (ar) {
      chai.expect(ar.indexOf('title')).to.be.above(-1);

      // unstub
      sinon.assert.calledOnce(cmsTemplates.template.execRequestColumns)
      cmsTemplates.template.execRequestColumns.restore()
      done()
    })
  });

  /**
   * cmsTemplates.encodeAbeTagAsComment
   * 
   */
  it('cmsTemplates.encodeAbeTagAsComment()', function() {
    var txt = cmsTemplates.encodeAbeTagAsComment(this.fixture.articleEach);
    chai.expect(txt.indexOf('{')).to.equal(-1);
  });
});
