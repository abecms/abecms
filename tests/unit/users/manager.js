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
  let fixture
  before( function() {
    config.users.enable = true
    fixture = {
      htmlIsAuthorized: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorized.html'), 'utf8'),
      htmlIsAuthorizedTrue: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorizedTrue.html'), 'utf8'),
      users: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'users', 'users.json'), 'utf8'))
    }
  });

  it('User.manager.instance.get', function(){
    var stubRead = sinon.stub(User.manager.instance, 'read');
    stubRead.returns(JSON.parse(JSON.stringify(fixture.users)))

    // test
    var res = User.manager.instance.get()
    chai.expect(res.length).to.be.above(0)

    // unstub
    sinon.restore()
  })

  it('User.manager.instance.save', function(){
    var stubFs = sinon.stub(fs, 'writeJsonSync');
    stubFs.returns(null)

    // test
    var res = User.manager.instance.save()

    // unstub
    sinon.assert.calledOnce(fs.writeJsonSync)
    sinon.restore()
  })

  it('User.manager.instance.read', function(){
    var stubFs = sinon.stub(fs, 'readFileSync');
    stubFs.returns(JSON.stringify(fixture.users))
    var stubExist = sinon.stub(coreUtils.file, 'exist');
    stubExist.returns(true)

    // test
    var res = User.manager.instance.read()
    chai.expect(res).to.not.be.null

    // unstub
    sinon.assert.calledOnce(fs.readFileSync)
    sinon.assert.calledOnce(coreUtils.file.exist)
    sinon.restore()
  })

  it('User.manager.instance.update', function(){
    var stubSave = sinon.stub(User.manager.instance, 'save');
    stubSave.returns(JSON.parse(JSON.stringify(fixture.users)))

    // test
    var res = User.manager.instance.update()
    chai.expect(res).to.be.equal(true)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.save)
    sinon.restore()
  })
});