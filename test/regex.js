var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var cmsData = require('../src/cli').cmsData
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Request', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {

        this.fixture = {
          article: fse.readFileSync(__dirname + '/fixtures/templates/article-regex.html', 'utf8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsData.regex.getAttr
   */
  it('cmsData.regex.getAttr()', function() {
    var attribute = cmsData.regex.getAttr(this.fixture.article, 'key')
    chai.assert.equal(attribute, 'title');
  });

  /**
   * cmsData.regex.escapeTextToRegex
   */
  it('cmsData.regex.escapeTextToRegex()', function() {
    var attribute = cmsData.regex.escapeTextToRegex(this.fixture.article, 'g')
    chai.expect(typeof attribute).to.contain('object');
  });
});