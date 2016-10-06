var chai = require('chai');
var path = require('path');

var config = require('../src/cli').config
config.set({root: __dirname + '/fixtures'})

var cmsData = require('../src/cli').cmsData
var Manager = require('../src/cli').Manager;
var fse = require('fs-extra');

describe('Revision', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {

        this.fixture = {
          tag: fse.readFileSync(__dirname + '/fixtures/templates/article.html', 'utf8'),
          jsonArticle: fse.readJsonSync(__dirname + '/fixtures/data/article-1.json'),
          jsonHomepage: fse.readJsonSync(__dirname + '/fixtures/data/homepage-1.json')
        }
        done()
        
      }.bind(this))
  });

  /**
   * cmsData.revision.getVersions
   * 
   */
  it('cmsData.revision.getVersions()', function() {
    var versions = cmsData.revision.getVersions('article-1.html')
    chai.expect(versions[0].name).to.be.equal('article-1.json');
  });

  /**
   * cmsData.revision.getDocumentRevision
   * 
   */
  it('cmsData.revision.getDocumentRevision()', function() {
    var version = cmsData.revision.getDocumentRevision('article-1.html')
    chai.expect(version.name).to.be.equal('article-1.json');
  });

  /**
   * cmsData.revision.getStatusAndDateToFileName
   * 
   */
  it('cmsData.revision.getStatusAndDateToFileName()', function() {
    var date = cmsData.revision.getStatusAndDateToFileName('20160919T125255138Z')
    chai.expect(date).to.be.equal('2016-09-19T12:52:55.138Z');
  });

  /**
   * cmsData.revision.removeStatusAndDateFromFileName
   * 
   */
  it('cmsData.revision.removeStatusAndDateFromFileName()', function() {
    var date = cmsData.revision.removeStatusAndDateFromFileName('2016-09-19T12:52:55.138Z')
    chai.expect(date).to.be.equal('20160919T125255138Z');
  });
});
