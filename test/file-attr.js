var chai = require('chai');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var cmsData = require('../src/cli').cmsData;
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('fileAttr', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        Manager.instance._whereKeys = ['title', 'priority', 'abe_meta', 'articles']
        Manager.instance.updateList()

        this.fixture = {
          jsonDraft: fse.readJsonSync(__dirname + '/fixtures/data/article-1-abe-d20160919T125255138Z.json')
        }
        done()
        
      }.bind(this))
  });
  
  /**
   * cmsData.fileAttr.test
   * 
   */
  it('cmsData.fileAttr.test()', function() {
    var bool = cmsData.fileAttr.test(this.fixture.jsonDraft.abe_meta.latest.abeUrl)
    chai.expect(bool).to.be.true;
    bool = cmsData.fileAttr.test(this.fixture.jsonDraft.abe_meta.link)
    chai.expect(bool).to.be.false;
  });

  /**
   * cmsData.fileAttr.delete
   * 
   */
  it('cmsData.fileAttr.delete()', function() {
  	var str = cmsData.fileAttr.delete(this.fixture.jsonDraft.abe_meta.latest.abeUrl)
    var bool = cmsData.fileAttr.test(str)
    chai.expect(bool).to.be.false;
  });
});
