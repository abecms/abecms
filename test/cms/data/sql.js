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

describe('Sql', function() {
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
  it('cmsData.sql.getDataSource', function() {
    var obj = {key:'titles'}
    var json = {abe_source:{}}
    var jsonString = cmsData.sql.getDataSource(this.fixture.articleJsoninline)
    chai.expect(jsonString.indexOf('rouge')).to.be.above(-1);
    JSON.parse(jsonString)
    jsonString = cmsData.sql.getDataSource(this.fixture.articleArrayinline)
    chai.expect(jsonString.indexOf('rouge')).to.be.above(-1);
    JSON.parse(jsonString)
  });
});
