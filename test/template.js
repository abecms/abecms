var chai = require('chai');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var getTemplate = require('../src/cli').getTemplate
var includePartials = require('../src/cli/cms/templates/abe-template').includePartials
var getAbeImport = require('../src/cli/cms/templates/abe-template').getAbeImport
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Template', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          template: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf-8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * getAbeImport
   * 
   */
  it('getAbeImport()', function() {
    var res = getAbeImport(this.fixture.template)
    chai.expect(res).to.have.length(4);
  });

  /**
   * includePartials
   * 
   */
  it('includePartials()', function() {
    var template = includePartials(this.fixture.template)
    chai.expect(template).to.contain("{{abe type='text' key='title' desc='titre' tab='default'}}");
  });

  /**
   * getTemplate
   * 
   */
  it('getTemplate()', function() {
    var template = getTemplate('article')
    chai.expect(template).to.contain("{{abe type='text' key='title' desc='titre' tab='default' order='1'}}");
  });
});
