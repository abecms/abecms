var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures/'})

var cmsTemplate = require('../src/cli').cmsTemplate;
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Data', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {

        this.fixture = {
          articleEach: fse.readFileSync(__dirname + '/fixtures/templates/article-each-abe.html', 'utf8'),
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsTemplate.encodeAbeTagAsComment
   * 
   */
  it('cmsTemplate.encodeAbeTagAsComment()', function() {
    var txt = cmsTemplate.encodeAbeTagAsComment(this.fixture.articleEach);
    chai.expect(txt.indexOf('{')).to.equal(-1);
  });
});
