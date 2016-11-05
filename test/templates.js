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
          template: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf-8'),
          articleEach: fse.readFileSync(__dirname + '/fixtures/templates/article-each-abe.html', 'utf-8'),
          templateKeys: fse.readFileSync(__dirname + '/fixtures/templates/article-keys.html', 'utf-8')
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
   * getTemplate
   * 
   */
  it('cmsTemplates.template.getSelectTemplateKeys()', function() {
    const pathTemplate = path.join(config.root, config.templates.url)
    cmsTemplates.template.getSelectTemplateKeys(pathTemplate)
      .then((whereKeys) => {
        chai.expect(whereKeys.indexOf('abe_meta.date')).to.be.above(-1);
      })
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
