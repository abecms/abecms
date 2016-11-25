var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var cmsTemplates = require('../src/cli').cmsTemplates;
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Template', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          slug: fse.readFileSync(path.join(__dirname, 'fixtures', 'templates', 'slug.html'), 'utf-8'),
          template: fse.readFileSync(path.join(__dirname, 'fixtures', 'templates', 'article.html'), 'utf-8'),
          articleEach: fse.readFileSync(path.join(__dirname, 'fixtures', 'templates', 'article-each-abe.html'), 'utf-8'),
          articlePrecontrib: fse.readFileSync(path.join(__dirname, 'fixtures', 'templates', 'article-precontribution.html'), 'utf-8'),
          templateKeys: fse.readFileSync(path.join(__dirname, 'fixtures', 'templates', 'article-keys.html'), 'utf-8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * getAbeImport
   * 
   */
  it('cmsTemplates.template.getStructureAndTemplates()', function() {
    var res = cmsTemplates.template.getStructureAndTemplates()
    chai.expect(res.templates.length).to.be.above(1);
  });

  /**
   * getAbeImport
   * 
   */
  it('cmsTemplates.template.getAbeImport()', function() {
    var res = cmsTemplates.template.getAbeImport(this.fixture.template)
    chai.expect(res).to.have.length(4);
  });

  /**
   * includePartials
   * 
   */
  it('cmsTemplates.template.includePartials()', function() {
    var template = cmsTemplates.template.includePartials(this.fixture.template)
    chai.expect(template).to.contain("{{abe type='text' key='title' desc='titre' tab='default'}}");
  });

  /**
   * cmsTemplates.template.getTemplate
   * 
   */
  it('cmsTemplates.template.getTemplate()', function() {
    var template = cmsTemplates.template.getTemplate('article')
    chai.expect(template).to.contain("{{abe type='text' key='title' desc='titre' tab='default' order='1'}}");
  });

  /**
   * cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist
   * 
   */
  it('cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist()', function() {
    var text = cmsTemplates.template.setAbeSlugDefaultValueIfDoesntExist("")
    chai.expect(text).to.be.equal(`{{abe type="slug" source="{{name}}"}}\n`);
  });

  /**
   * cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist
   * 
   */
  it('cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist()', function() {
    var text = cmsTemplates.template.setAbePrecontribDefaultValueIfDoesntExist("")
    chai.expect(text).to.be.equal(`{{abe type='text' key='name' desc='Name' required="true" tab="slug" visible="false"}}\n`);
  });

  /**
   * cmsTemplates.template.getAbePrecontribFromTemplates
   * 
   */
  it('cmsTemplates.template.getAbePrecontribFromTemplates()', function() {
    var precontrib = cmsTemplates.template.getAbePrecontribFromTemplates([{name: 'slug', template: this.fixture.slug}])
    chai.expect(precontrib.fields[0]).to.not.be.undefined;
  });

  /**
   * cmsTemplates.template.getAbeSlugFromTemplates
   * 
   */
  it('cmsTemplates.template.getAbeSlugFromTemplates()', function() {
    var slug = cmsTemplates.template.getAbeSlugFromTemplates([{name: 'slug', template: this.fixture.slug}])
    chai.expect(slug.slug).to.not.be.undefined;
  });

  /**
   * getTemplate
   * 
   */
  it('cmsTemplates.template.execRequestColumns()', function() { // templateKeys
    const pathTemplate = path.join(config.root, config.templates.url)
    var ar = cmsTemplates.template.execRequestColumns(this.fixture.templateKeys)
    chai.expect(ar.indexOf('abe_meta.date')).to.be.above(-1);
  });

  /**
   * cmsTemplates.insertDebugtoolUtilities
   * 
   */
  it('cmsTemplates.insertDebugtoolUtilities()', function() {
    var txt = cmsTemplates.insertDebugtoolUtilities('</body>');
    chai.expect(txt.length).to.above(10);
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
