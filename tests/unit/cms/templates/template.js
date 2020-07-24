var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var abeExtend = require('../../../../src/cli').abeExtend;
var cmsData = require('../../../../src/cli').cmsData;
var cmsTemplates = require('../../../../src/cli').cmsTemplates;
var coreUtils = require('../../../../src/cli').coreUtils;
var Manager = require('../../../../src/cli').Manager;

describe('cmsTemplates', function() {
  let fixture
  before(async () => {
    await Manager.instance.init()
    fixture = {
      slug: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'slug.html'), 'utf-8'),
      article: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article.html'), 'utf-8'),
      local: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'local.html'), 'utf-8'),
      articleSingleAbe: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-single-abe.html'), 'utf-8'),
      articleOrderAbe: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-order-abe.html'), 'utf-8'),
      articleRequest: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-request.html'), 'utf-8'),
      template: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'import.html'), 'utf-8'),
      articleEach: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-each-abe.html'), 'utf-8'),
      articlePrecontrib: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-precontribution.html'), 'utf-8'),
      templateKeys: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article-keys.html'), 'utf-8'),
      templatePaths: path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'templates/article.html'),
      structurePaths: path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'templates/structure/0-1'),
      import: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'import.html'), 'utf-8'),
      pathTemplates: path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates'),
      pathPartials: path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'partials'),
      count: 0
    }
  })

  /**
   * cmsTemplates.template.getTemplatesAndPartials
   * 
   */
  it('cmsTemplates.template.getTemplatesAndPartials()', function(done) {

    cmsTemplates.template.getTemplatesAndPartials(fixture.pathTemplates, fixture.pathPartials)
    .then((templatesList) => {
      chai.expect(templatesList.length).to.be.equal(30);
      done()
    })
  });

  /**
   * 
   * 
   */
  it('cmsTemplates.template.addOrder()', function() {
    var getAttr = sinon.stub(cmsData.regex, 'getAttr');
    getAttr.returns(null)

    // test
    var html = cmsTemplates.template.addOrder(fixture.articleSingleAbe)
    chai.expect(html).to.not.be.equal(fixture.articleSingleAbe);
    chai.expect(html.indexOf('order')).to.above(-1);

    sinon.restore()
  });

  /**
   * 
   * 
   */
  it('cmsTemplates.template.addOrder() more options', function() {
    var html = cmsTemplates.template.addOrder(fixture.articleOrderAbe)
    chai.expect(html.indexOf("key='key1' desc='key1' order='2'")).to.above(-1);
    chai.expect(html.indexOf("key='key2' desc='key2' group='1' order='5'")).to.above(-1);
    chai.expect(html.indexOf("key='key3' desc='key3' order='3' group='1'")).to.above(-1);
    chai.expect(html.indexOf("key='key4' desc='key4' order='4' group='2'")).to.above(-1);
    chai.expect(html.indexOf("key='key5' desc='key5' order='6'")).to.above(-1);
    chai.expect(html.indexOf("key='key6' desc='key6' order='1' group='1'")).to.above(-1);
    chai.expect(html.indexOf("key='key7' desc='key7' group='2' order='7'")).to.above(-1);
  });

  /**
   * cmsTemplates.template.getStructureAndTemplates
   * 
   */
  it('cmsTemplates.template.getStructureAndTemplates()', function() {
    var stubGetFoldersSync = sinon.stub(coreUtils.file, 'getFoldersSync');
    stubGetFoldersSync.returns({path: fixture.structurePaths, folders: []})
    var stubGetFilesSync = sinon.stub(coreUtils.file, 'getFilesSync');
    stubGetFilesSync.returns([fixture.templatePaths])

    var res = cmsTemplates.template.getStructureAndTemplates()
    chai.expect(res.templates.length).to.be.equal(1);

    sinon.assert.calledOnce(coreUtils.file.getFoldersSync)
    sinon.assert.calledOnce(coreUtils.file.getFilesSync)
    sinon.restore()
  });

  /**
   * getAbeImport
   * 
   */
  it('cmsTemplates.template.getAbeImport()', function() {
    var res = cmsTemplates.template.getAbeImport(fixture.template)
    chai.expect(res).to.have.length(1);
  });

  /**
   * translate
   * 
   */
  it('cmsTemplates.template.translate()', function() {
    var getAttr = sinon.stub(cmsData.regex, 'getAttr').callsFake( (math, type) => {
      if (type === 'locale') {
        return 'gb'
      }
      if (type === 'source') {
        return 'test'
      }
    })
    var escapeTextToRegex = sinon.stub(cmsData.regex, 'escapeTextToRegex');
    escapeTextToRegex.returns(new RegExp(fixture.local, 'g'))

    // test
    var res = cmsTemplates.template.translate(fixture.local)
    chai.expect(res.indexOf('i18nAbe')).to.above(-1);

    sinon.assert.calledOnce(cmsData.regex.escapeTextToRegex)
    sinon.restore()
  });

  /**
   * getVariablesInWhere
   * 
   */
  it('cmsTemplates.template.getVariablesInWhere()', function() {

    var res = cmsTemplates.template.getVariablesInWhere({left: {column: 'title'}, right: {value: "test"}, operator: 'AND'})
    chai.expect(res.length).to.above(-1);

  });

  /**
   * recurseWhereVariables
   * 
   */
  it('cmsTemplates.template.recurseWhereVariables()', function() {

    var res = cmsTemplates.template.recurseWhereVariables({left: {column: 'title'}, right: {value: "test"}})
    chai.expect(res.length).to.above(-1);

  });

  /**
   * getTemplatesTexts
   * 
   */
  it('cmsTemplates.template.getTemplatesTexts()', function(done) {
    var readFileSync = sinon.stub(fse, 'readFileSync');
    readFileSync.returns("test")

    // test
    cmsTemplates.template.getTemplatesTexts(['test'])
    .then(function (res) {
      chai.expect(res[0].name).to.be.equal('test');

      sinon.assert.calledOnce(fse.readFileSync)
      sinon.restore()
      done()
    })
  });

  /**
   * includePartials
   * 
   */
  it('cmsTemplates.template.includePartials()', function() {
    var stubReadFileSync = sinon.stub(fse, 'readFileSync');
    stubReadFileSync.returns("test")
    var stubGetAbeImport = sinon.stub(cmsTemplates.template, 'getAbeImport').callsFake( () => {
      if (fixture.count === 0) {
        fixture.count++
        return [fixture.import]
      }
      return []
    })
    var stubGetAll = sinon.stub(cmsData.attributes, 'getAll');
    stubGetAll.returns({file: 'import.html'})
    var stubEscapeTextToRegex = sinon.stub(cmsData.regex, 'escapeTextToRegex');
    stubEscapeTextToRegex.returns(new RegExp(fixture.import, 'g'))
    var stubFile = sinon.stub(coreUtils.file, 'exist').callsFake( () => {
      return true
    })

    // test
    var template = cmsTemplates.template.includePartials(fixture.template)
    chai.expect(template).to.be.equal("test");

    // unstub
    sinon.assert.calledOnce(fse.readFileSync)
    sinon.assert.calledTwice(cmsTemplates.template.getAbeImport)
    sinon.assert.calledOnce(cmsData.attributes.getAll)
    sinon.assert.calledOnce(coreUtils.file.exist)
    sinon.assert.calledOnce(cmsData.regex.escapeTextToRegex)
    sinon.restore()
  });

  it('cmsTemplates.template.includePartials()', function() {
    var stubReadFileSync = sinon.stub(fse, 'readFileSync');
    stubReadFileSync.returns("test")

    var template = cmsTemplates.template.includePartials("{{abe type='import' file='{{test}}'}}", {"test" : "test.html"})
    fse.readFileSync.restore()
    chai.expect(template).to.be.equal("test")
    sinon.restore()
  });

  it('cmsTemplates.template.includePartials() with []', function() {
    var stubReadFileSync = sinon.stub(fse, 'readFileSync');
    stubReadFileSync.withArgs(path.join(config.root, config.themes.path, config.themes.name, config.themes.partials.path, 'test.html')).returns('test');
    stubReadFileSync.withArgs(path.join(config.root, config.themes.path, config.themes.name, config.themes.partials.path, 'title.html')).returns('title');

    var template = cmsTemplates.template.includePartials("{{abe type='import' file='{{test[].value}}'}}", {"test" : [{"value":"test.html"}, {"value":"title.html"}]})
    sinon.restore()
    chai.expect(template).to.be.equal("testtitle")
  });

  /**
   * cmsTemplates.template.getTemplate
   * 
   */
  it('cmsTemplates.template.getTemplate()', function() {
    var stubReadFileSync = sinon.stub(fse, 'readFileSync');
    stubReadFileSync.returns(fixture.article)
    var stubTrigger = sinon.stub(abeExtend.hooks.instance, 'trigger').callsFake( (p1, p2) => {
      return p2
    })
    var stubExist = sinon.stub(coreUtils.file, 'exist');
    stubExist.returns(true)
    var stubIncludePartials = sinon.stub(cmsTemplates.template, 'includePartials');
    stubIncludePartials.returns(fixture.article)
    var stubTranslate = sinon.stub(cmsTemplates.template, 'translate');
    stubTranslate.returns(fixture.article)
    var stubAddOrder = sinon.stub(cmsTemplates.template, 'addOrder');
    stubAddOrder.returns(fixture.article)

    var template = cmsTemplates.template.getTemplate('article')
    chai.expect(template).to.be.equal(fixture.article);

    sinon.assert.calledOnce(fse.readFileSync)
    sinon.assert.calledTwice(abeExtend.hooks.instance.trigger)
    sinon.assert.calledOnce(coreUtils.file.exist)
    sinon.assert.calledOnce(cmsTemplates.template.includePartials)
    sinon.assert.calledOnce(cmsTemplates.template.translate)
    sinon.assert.calledOnce(cmsTemplates.template.addOrder)
    sinon.restore()
  });

  /**
   * cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist
   * 
   */
  it('cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist()', function() {
    var stubGetTagAbeWithType = sinon.stub(cmsData.regex, 'getTagAbeWithType');
    stubGetTagAbeWithType.returns(null)

    // test
    var text = cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist(fixture.slug)
    chai.expect(text).to.not.be.equal(fixture.slug);

    // unstub
    sinon.assert.calledOnce(cmsData.regex.getTagAbeWithType)
    sinon.restore()
  });

  /**
   * cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist
   * 
   */
  it('cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist()', function() {
    var stubGetTagAbeWithTab = sinon.stub(cmsData.regex, 'getTagAbeWithTab');
    stubGetTagAbeWithTab.returns(null)

    // test
    var text = cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist(fixture.slug)
    chai.expect(text).to.not.be.equal(fixture.slug);

    // unstub
    sinon.assert.calledOnce(cmsData.regex.getTagAbeWithTab)
    sinon.restore()
  });

  /**
   * cmsTemplates.template.getAbePrecontribFromTemplates
   * 
   */
  it('cmsTemplates.template.getAbePrecontribFromTemplates()', function() {

    // test
    var precontrib = cmsTemplates.template.getAbePrecontribFromTemplates([{name: 'slug', template: fixture.slug}])
    chai.expect(precontrib[0]).to.not.be.undefined;
  });

  /**
   * cmsTemplates.template.getAbeSlugFromTemplates
   * 
   */
  it('cmsTemplates.template.getAbeSlugFromTemplates()', function() {
    var setAbeSlugDefaultValueIfDoesntExist = sinon.stub(cmsTemplates.template, 'setAbeSlugDefaultValueIfDoesntExist');
    setAbeSlugDefaultValueIfDoesntExist.returns(fixture.slug)
    var getTagAbeWithType = sinon.stub(cmsData.regex, 'getTagAbeWithType');
    getTagAbeWithType.returns(['{{abe type="slug" source="{{name}}"}}'])
    var getAll = sinon.stub(cmsData.attributes, 'getAll');
    getAll.returns({sourceString: 'test.html', name: 'test'})

    var slug = cmsTemplates.template.getAbeSlugFromTemplates([{name: 'slug', template: fixture.slug}])
    chai.expect(slug.slug).to.not.be.undefined;

    // unstub
    sinon.assert.calledOnce(cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist)
    sinon.assert.calledOnce(cmsData.regex.getTagAbeWithType)
    sinon.assert.calledOnce(cmsData.attributes.getAll)
    sinon.restore()
  });

  /**
   * getTemplate
   * 
   */
  it('cmsTemplates.template.execRequestColumns()', function() {
    var getTagAbeTypeRequest = sinon.stub(cmsData.regex, 'getTagAbeTypeRequest');
    getTagAbeTypeRequest.returns([fixture.articleRequest])
    var getSourceType = sinon.stub(cmsData.sql, 'getSourceType');
    getSourceType.returns('request')
    var handleSqlRequest = sinon.stub(cmsData.sql, 'handleSqlRequest');
    handleSqlRequest.returns({columns: ['title'], where: {left: 'title'}})
    var recurseWhereVariables = sinon.stub(cmsTemplates.template, 'recurseWhereVariables');
    recurseWhereVariables.returns('title2')

    // test
    const pathTemplate = path.join(config.root, config.themes.path, config.themes.name, config.themes.templates.path)
    var ar = cmsTemplates.template.execRequestColumns(fixture.templateKeys)
    chai.expect(ar.indexOf('title')).to.be.above(-1);

    // unstub
    sinon.assert.calledOnce(cmsData.regex.getTagAbeTypeRequest)
    sinon.assert.calledOnce(cmsData.sql.getSourceType)
    sinon.assert.calledOnce(cmsData.sql.handleSqlRequest)
    sinon.assert.calledOnce(cmsTemplates.template.recurseWhereVariables)
    sinon.restore()
  });

  /**
   * getTemplate
   * 
   */
  it('cmsTemplates.template.getAbeRequestWhereKeysFromTemplates()', function(done) {
    var execRequestColumns = sinon.stub(cmsTemplates.template, 'execRequestColumns');
    execRequestColumns.returns(['title'])

    // test
    const pathTemplate = path.join(config.root, config.themes.path, config.themes.name, config.themes.templates.path)
    cmsTemplates.template.getAbeRequestWhereKeysFromTemplates([fixture.articleRequest])
    .then(function (ar) {
      chai.expect(ar.indexOf('title')).to.be.above(-1);

      // unstub
      sinon.assert.calledOnce(cmsTemplates.template.execRequestColumns)
      sinon.restore()
      done()
    })
  });

  /**
   * cmsTemplates.encodeAbeTagAsComment
   * 
   */
  it('cmsTemplates.encodeAbeTagAsComment()', function() {
    var txt = cmsTemplates.encodeAbeTagAsComment(fixture.articleEach);
    chai.expect(txt.indexOf('{')).to.equal(-1);
  });
});
