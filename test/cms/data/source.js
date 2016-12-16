var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var cmsData = require('../../../src/cli').cmsData;
var Manager = require('../../../src/cli').Manager;

describe('Source', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {
          articleJsoninline: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article-data-jsoninline.html'), 'utf8'),
          articleArrayinline: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article-data-arrayinline.html'), 'utf8')
        }
        done()
        
      }.bind(this))
  });

  /**
   * 
   * 
   */
  it('cmsData.source.valueList', function(done) {
    var obj = {key:'titles'}
    var json = {abe_source:{}}
    cmsData.source.valueList(obj, this.fixture.articleJsoninline, json)
      .then(() => {
        chai.expect(json.abe_source.titles.length).to.be.equal(3);
        chai.expect(json.abe_source.titles[0].title).to.be.equal("rouge");
        

        obj = {key:'titles'}
        json = {abe_source:{}}
        cmsData.source.valueList(obj, this.fixture.articleArrayinline, json)
          .then(() => {
            chai.expect(json.abe_source.titles.length).to.be.equal(3);
            done()
          })
      })
  });
});
