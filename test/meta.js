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
try{
        this.fixture = {
          tag: fse.readFileSync(path.join(__dirname, 'fixtures', 'templates', 'article.html'), 'utf8')
        }
}catch(e){
  console.log("err", e)
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
    cmsData.metas.add(json, 'draft');
    chai.expect(json.abe_meta.date).to.not.be.undefined;
  });

  /**
   * cmsData.meta.create
   * 
   */
  it('cmsData.metas.create()', function() {
    var json = cmsData.metas.create({}, 'draft', 'test.html');
    chai.expect(json.abe_meta.link).to.not.be.undefined;
  });
});
