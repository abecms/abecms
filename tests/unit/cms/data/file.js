var chai = require('chai');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', '/fixtures/')})

var cmsData = require('../../../../src/cli').cmsData;
var Manager = require('../../../../src/cli').Manager;

describe('Meta', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        try{
          this.fixture = {
            tag: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article.html'), 'utf8')
          }
        }catch(e){
          console.log("err", e)
        }
        done()
        
      }.bind(this))
  });

  it('cmsData.file.getAbeMeta() 1', function() {
    var json = {
      abe_meta: {
        link: 'article.html',
        name: 'testname',
        latest: {
          date: "2016-10-15T16:35:41.943Z",
          abeUrl: "/articles/coding/index-abe-d20161015T163541943Z.html"
        },
      }
    };
    var result = cmsData.file.getAbeMeta({}, json);
    chai.expect(result.abe_meta.date).to.not.be.undefined;
  });

  it('cmsData.file.getAbeMeta() 2', function() {
    var json = {
      abe_meta: {
        link: 'article.html',
        name: 'testname',
        date: "2016-10-15T16:35:41.943Z"
      }
    };
    var result = cmsData.file.getAbeMeta({}, json);
    chai.expect(result.abe_meta.date).to.not.be.undefined;
  });

  it('cmsData.file.getAbeMeta() 3', function() {
    var json = {
      abe_meta: {
        link: 'article.html',
        name: 'testname',
        updatedDate: "2016-10-15T16:35:41.943Z"
      }
    };
    var result = cmsData.file.getAbeMeta({}, json);
    chai.expect(result.abe_meta.date).to.not.be.undefined;
  });
});
