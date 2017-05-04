var chai = require('chai');
var path = require('path');

var Manager = require('../../../src/cli').Manager
var config = require('../../../src/cli').config
var cmsOperations = require('../../../src/cli').cmsOperations
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var cmsData = require('../../../src/cli').cmsData;
var Manager = require('../../../src/cli').Manager;
var fse = require('fs-extra');

describe('Manager', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {

        this.fixture = {
          tag: fse.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'article.html'), 'utf8'),
          jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'test', 'fixtures', 'files', 'article-4.json')),
          jsonArticle1: fse.readJsonSync(path.join(process.cwd(), 'test', 'fixtures', 'data', 'article-1.json'))
        }
        done()
        
      }.bind(this))
  });

  it('getStructureAndTemplates()', function() {
    const data = Manager.instance.getStructureAndTemplates()
    chai.assert.equal(data['templates'][0].name, 'article-data-arrayinline', 'failed !')
    chai.assert.equal(data['templates'].length, 28, 'failed !')
  });

  it('updateStructureAndTemplates()', function() {
    Manager.instance.updateStructureAndTemplates()
    const data = Manager.instance.getStructureAndTemplates()
    chai.assert.equal(data['templates'][0].name, 'article-data-arrayinline', 'failed !')
    chai.assert.equal(data['templates'].length, 28, 'failed !')
  });

  it('getList()', function() {
    const list = Manager.instance.getList()
    chai.assert.equal(list[0].name, 'article-1.json', 'failed !')
    chai.assert.equal(list.length, 3, 'failed !')
  });

  it('getListWithStatusOnFolder() status publish', function() {
    const list = Manager.instance.getListWithStatusOnFolder('publish')
    chai.assert.equal(list[0].name, 'article-1.json', 'failed !')
    chai.assert.equal(list.length, 2, 'failed !')
  });

  it('getListWithStatusOnFolder() status draft', function() {
    const list = Manager.instance.getListWithStatusOnFolder('draft')
    chai.assert.equal(list.length, 2, 'failed !')
  });

  it('getListWithStatusOnFolder() status review', function() {
    const list = Manager.instance.getListWithStatusOnFolder('review')
    chai.assert.equal(list.length, 0, 'failed !')
  });

  it('getListWithStatusOnFolder() status draft /0-1', function() {
    const list = Manager.instance.getListWithStatusOnFolder('draft', '0-1')
    chai.assert.equal(list[0].name, 'article-2.json', 'failed !')
    chai.assert.equal(list.length, 1, 'failed !')
  });

  it('getPage() ', function() {
    const list = Manager.instance.getPage()
    chai.assert.equal(list.data[0].name, 'article-1.json', 'failed !')
    chai.assert.equal(list.recordsTotal, 3, 'failed !')
  });
});
