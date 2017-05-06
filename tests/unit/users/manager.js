var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var fs = require('fs-extra');
var path = require('path');

var coreUtils = require('../../../src/cli').coreUtils
var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var User = require('../../../src/cli').User;

describe('User.manager', function() {
  before( function() {
    config.users.enable = true
    this.fixture = {
      htmlIsAuthorized: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorized.html'), 'utf8'),
      htmlIsAuthorizedTrue: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorizedTrue.html'), 'utf8'),
      users: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'users', 'users.json'), 'utf8'))
    }
  });

  it('User.manager.instance.get', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubRead = sinonInstance.stub(User.manager.instance, 'read');
    stubRead.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    var res = User.manager.instance.get()
    chai.expect(res.length).to.be.above(0)

    // unstub
    User.manager.instance.read.restore()
  })

  it('User.manager.instance.save', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubFs = sinonInstance.stub(fs, 'writeJsonSync');
    stubFs.returns(null)

    // test
    var res = User.manager.instance.save()

    // unstub
    sinon.assert.calledOnce(fs.writeJsonSync)
    fs.writeJsonSync.restore()
  })

  it('User.manager.instance.read', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubFs = sinonInstance.stub(fs, 'readFileSync');
    stubFs.returns(JSON.stringify(this.fixture.users))
    var stubExist = sinonInstance.stub(coreUtils.file, 'exist');
    stubExist.returns(true)

    // test
    var res = User.manager.instance.read()
    chai.expect(res).to.not.be.null

    // unstub
    sinon.assert.calledOnce(fs.readFileSync)
    fs.readFileSync.restore()
    sinon.assert.calledOnce(coreUtils.file.exist)
    coreUtils.file.exist.restore()
  })

  it('User.manager.instance.update', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubSave = sinonInstance.stub(User.manager.instance, 'save');
    stubSave.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    var res = User.manager.instance.update()
    chai.expect(res).to.be.equal(true)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.save)
    User.manager.instance.save.restore()
  })
});