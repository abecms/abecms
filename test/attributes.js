var chai = require('chai');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var cmsData = require('../src/cli').cmsData;
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Request', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          html: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf8'),
          json: fse.readJsonSync(__dirname + '/fixtures/data/article-1.json')
        }
        done()
        
      }.bind(this))
  });
  /**
   * getAbeImport
   * 
   */
  it('cmsData.removeDuplicateAttr', function() {
  	var newJson = cmsData.removeDuplicateAttr(this.fixture.html, this.fixture.json)
  	chai.expect(newJson.title).to.be.undefined;
  });
});
