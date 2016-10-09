var chai = require('chai');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var cmsData = require('../src/cli').cmsData;
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('attributes', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          tag: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf8'),
          html: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf8'),
          json: fse.readJsonSync(__dirname + '/fixtures/data/article-1.json')
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsData.values.removeDuplicate
   * 
   */
  it('cmsData.values.removeDuplicate', function() {
    var newJson = cmsData.values.removeDuplicate(this.fixture.html, this.fixture.json)
    chai.expect(newJson.title).to.be.undefined;
  });

  /**
   * cmsData.attributes.sanitizeSourceAttribute
   * 
   */
  it('cmsData.attributes.sanitizeSourceAttribute', function() {
  	// not sure what it does
  });

  /**
   * cmsData.attributes.getAll
   * 
   */
  it('cmsData.attributes.getAll()', function(done) {
    var attributes = cmsData.attributes.getAll(this.fixture.tag, this.fixture.jsonArticle)
    chai.expect(attributes.sourceString).to.contain('select');
    done();
  });
});
