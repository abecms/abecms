var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures/'})

var cmsData = require('../src/cli').cmsData;
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Meta', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {

        this.fixture = {
          tag: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsData.meta.add
   * 
   */
  it('cmsData.metas.add()', function() {
    var json = {abe_meta: {link: 'article.html'}};
    cmsData.metas.add('article', json);
    chai.expect(json.abe_meta.date).to.not.be.undefined;
  });
});
