var chai = require('chai');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', '/fixtures/')})

var cmsData = require('../../../src/cli').cmsData;
var Manager = require('../../../src/cli').Manager;

describe('Meta', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        try{
          this.fixture = {
            tag: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article.html'), 'utf8')
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
    chai.expect(json.abe_meta.updatedDate).to.not.be.undefined;
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
