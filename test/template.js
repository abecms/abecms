var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var cmsTemplate = require('../src/cli').cmsTemplate;
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Template', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          template: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf-8'),
          templateKeys: fse.readFileSync(__dirname + '/fixtures/templates/article-keys.html', 'utf-8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * getAbeImport
   * 
   */
  it('cmsTemplate.template.getAbeImport()', function() {
    var res = cmsTemplate.template.getAbeImport(this.fixture.template)
    chai.expect(res).to.have.length(4);
  });

  /**
   * includePartials
   * 
   */
  it('cmsTemplate.template.includePartials()', function() {
    var template = cmsTemplate.template.includePartials(this.fixture.template)
    chai.expect(template).to.contain("{{abe type='text' key='title' desc='titre' tab='default'}}");
  });

  /**
   * cmsTemplate.template.getTemplate
   * 
   */
  it('cmsTemplate.template.getTemplate()', function() {
    var template = cmsTemplate.template.getTemplate('article')
    chai.expect(template).to.contain("{{abe type='text' key='title' desc='titre' tab='default' order='1'}}");
  });

  /**
   * getTemplate
   * 
   */
  it('cmsTemplate.template.getSelectTemplateKeys()', function() {
    const pathTemplate = path.join(config.root, config.templates.url)
    cmsTemplate.template.getSelectTemplateKeys(pathTemplate)
      .then((whereKeys) => {
        chai.expect(whereKeys.indexOf('abe_meta.date')).to.be.above(-1);
      })
  });

  /**
   * getTemplate
   * 
   */
  it('cmsTemplate.template.execRequestColumns()', function() { // templateKeys
    const pathTemplate = path.join(config.root, config.templates.url)
    var ar = cmsTemplate.template.execRequestColumns(this.fixture.templateKeys)
    chai.expect(ar.indexOf('abe_meta.date')).to.be.above(-1);
  });
});
