var chai = require('chai');
var path = require('path');
import sinonChai from'sinon-chai'
chai.use(sinonChai)
import sinon from 'sinon'

var Manager = require('../../../../src/cli').Manager
var config = require('../../../../src/cli').config
var cmsOperations = require('../../../../src/cli').cmsOperations
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var cmsData = require('../../../../src/cli').cmsData;
var Manager = require('../../../../src/cli').Manager;
var fse = require('fs-extra');

describe('Manager', function() {
  let fixture
  before(async () => {
    await Manager.instance.init()

    fixture = {
      tag: fse.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'article.html'), 'utf8'),
      jsonArticle: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'files', 'article-4.json')),
      jsonArticle1: fse.readJsonSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'article-1.json'))
    }
  })

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

  it('updatePostInList() ', async () => {
    let list = Manager.instance.getList()
    chai.assert.equal(list[0].revisions.length, 2, 'failed !')
    await Manager.instance.updatePostInList(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'article-1-abe-d20160919T125255138Z.json'))
    list = Manager.instance.getList()
    chai.assert.equal(list[0].revisions.length, 3, 'failed !')
  });

  it('historize() ', async () => {
    sinon.stub(cmsOperations.remove, 'removeRevision').callsFake( () => {
      return true;
    })
    sinon.stub(cmsOperations.remove, 'removePost').callsFake( () => {
      return true;
    })
    let list = Manager.instance.getList()
    //chai.assert.equal(list[0].revisions.length, 2, 'failed !')
    
    config.set({data: {history: 1}})
    await Manager.instance.updatePostInList(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'article-1-abe-d20160919T125255138Z.json'))
    await Manager.instance.updatePostInList(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'data', 'article-1-abe-d20160919T125255138Z.json'))

    Manager.instance.historize(0)
    list = Manager.instance.getList()
    chai.assert.equal(list[0].revisions.length, 1, 'failed !')
    
    config.set({data: {history: 0}})
    sinon.restore()
  });

  it('Connections', function() {
    Manager.instance.addConnection('usertest1')
    Manager.instance.addConnection('usertest2')
    var res = Manager.instance.getConnections()
    chai.assert.equal(res.length, 2, 'failed !')

    Manager.instance.removeConnection('usertest1')
    res = Manager.instance.getConnections()
    chai.assert.equal(res.length, 1, 'failed !')
    chai.assert.equal(res[0], 'usertest2', 'failed !')
  });

  // activities work when the user option is activated
  // it('Activities', function() {
  //   Manager.instance.addActivity('a1')
  //   Manager.instance.addActivity('a2')
  //   var res = Manager.instance.getActivities()
  //   chai.assert.equal(res.length, 2, 'failed !')

  //   for(var i=3; i < 54; i++){
  //     Manager.instance.addActivity('a'+i)
  //   }

  //   res = Manager.instance.getActivities()
  //   chai.assert.equal(res.length, 50, 'failed !')
  //   chai.assert.equal(res[49], 'a53', 'failed !')
  // });

});
