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

  it('cmsData.sql.executeOrderByClause', function() {
    var files = [
      {"title":"title1", "abe_meta":{"date":"2017-01-27T13:19:58.877Z"}},
      {"title":"title2", "abe_meta":{"date":"2017-01-12T03:01:27.729Z"}},
      {"title":"title3", "abe_meta":{"date":"2017-01-12T03:06:14.832Z"}},
    ]

    var orderby = {
      column: 'abe_meta.date',
      type: 'asc'
    }
    var result = cmsData.sql.executeOrderByClause(files, orderby)
    chai.expect(result[0].title).to.be.equal('title2');

    var orderby = {
      column: 'abe_meta.date',
      type: 'desc'
    }
    var result = cmsData.sql.executeOrderByClause(files, orderby)
    chai.expect(result[0].title).to.be.equal('title1');

    var orderby = {
      column: 'title',
      type: 'asc'
    }
    var result = cmsData.sql.executeOrderByClause(files, orderby)
    chai.expect(result[0].title).to.be.equal('title1');

    var orderby = {
      column: 'title',
      type: 'desc'
    }
    var result = cmsData.sql.executeOrderByClause(files, orderby)
    chai.expect(result[0].title).to.be.equal('title3');

    var orderby = {
      column: 'date',
      type: 'asc'
    }
    var result = cmsData.sql.executeOrderByClause(files, orderby)
    chai.expect(result[0].title).to.be.equal('title2');

    var orderby = {
      column: 'date',
      type: 'desc'
    }
    var result = cmsData.sql.executeOrderByClause(files, orderby)
    chai.expect(result[0].title).to.be.equal('title1');
  });
  
});
