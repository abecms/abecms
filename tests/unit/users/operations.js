var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var fs = require('fs-extra');
var mkdirp = require('mkdirp');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
var Cookies = require('cookies');
var jwt = require('jwt-simple');
var Handlebars =require('../../../src/cli').Handlebars

var coreUtils = require('../../../src/cli').coreUtils
var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var User = require('../../../src/cli').User;

describe('User.operations', function() {
  let fixture
  before( function() {
    config.users.enable = true
    fixture = {
      htmlIsAuthorized: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorized.html'), 'utf8'),
      htmlIsAuthorizedTrue: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorizedTrue.html'), 'utf8'),
      users: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'users', 'users.json'), 'utf8'))
    }
  });

  it('User.operations.deactivate', function(){
    var stub = sinon.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(fixture.users)))
    var stubSave = sinon.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var bdd = User.operations.deactivate(1)
    chai.expect(bdd[0].actif).to.equal(0)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.assert.calledOnce(User.manager.instance.save)
    sinon.restore()
  })

  it('User.operations.activate', function(){
    var stub = sinon.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(fixture.users)))
    var stubSave = sinon.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var bdd = User.operations.activate(1)
    chai.expect(bdd[0].actif).to.equal(1)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.assert.calledOnce(User.manager.instance.save)
    sinon.restore()
  })

  it('User.operations.remove', function(){
    var stub = sinon.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(fixture.users)))
    var stubSave = sinon.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var bdd = User.operations.remove(1)
    chai.expect(bdd.length).to.equal(0)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.assert.calledOnce(User.manager.instance.save)
    sinon.restore()
  })

  it('User.operations.update', function(){
    var stubTextXss = sinon.stub(coreUtils.text, 'checkXss');
    stubTextXss.returns({ success:1 });
    var stubCheckSameEmail = sinon.stub(User.utils, 'checkSameEmail');
    stubCheckSameEmail.returns({ success:1 });
    var stubGetRole = sinon.stub(User.utils, 'getRole');
    stubGetRole.returns(JSON.parse(JSON.stringify(fixture.users))[0].role);
    var stubGet = sinon.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(fixture.users)))
    var stubSave = sinon.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var bdd = User.operations.update({id: 2})
    chai.expect(bdd.user.id).to.be.equal(2)

    // unstub
    sinon.assert.calledOnce(coreUtils.text.checkXss)
    sinon.assert.calledOnce(User.utils.checkSameEmail)
    sinon.assert.calledOnce(User.utils.getRole)
    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.assert.calledOnce(User.manager.instance.save)
    sinon.restore()
  })

  it('User.operations.updatePassword', function(){
    var stubCommonPassword = sinon.stub(User.utils, 'commonPassword');
    stubCommonPassword.returns({ success:1 });
    var stubEncryptPassword = sinon.stub(User.utils, 'encryptPassword');
    stubEncryptPassword.returns("newPassword2");
    var stubGet = sinon.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(fixture.users)))
    var stubSave = sinon.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var oldPassword = JSON.parse(JSON.stringify(fixture.users)).password
    var bdd = User.operations.updatePassword(JSON.parse(JSON.stringify(fixture.users))[0], "newPassword")
    chai.expect(bdd.user.password).to.not.be.equal(oldPassword)

    // unstub
    sinon.assert.calledOnce(User.utils.commonPassword)
    sinon.assert.calledOnce(User.utils.encryptPassword)
    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.assert.calledOnce(User.manager.instance.save)
    sinon.restore()
  })

  it('User.operations.add', function(){
    var stubTextXss = sinon.stub(coreUtils.text, 'checkXss');
    stubTextXss.returns({ success:1 });
    var stubCheckSameEmail = sinon.stub(User.utils, 'checkSameEmail');
    stubCheckSameEmail.returns({ success:1 });
    var stubCommonPassword = sinon.stub(User.utils, 'commonPassword');
    stubCommonPassword.returns({ success:1 });
    var stubEncryptPassword = sinon.stub(User.utils, 'encryptPassword');
    stubEncryptPassword.returns("newPassword2");
    var stubGetRole = sinon.stub(User.utils, 'getRole');
    stubGetRole.returns(JSON.parse(JSON.stringify(fixture.users))[0].role);
    var stubGet = sinon.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(fixture.users)))
    var stubSave = sinon.stub(User.manager.instance, 'save');
    stubSave.returns(null)
    
    // test
    var res = User.operations.add(JSON.parse(JSON.stringify(fixture.users))[0])
    chai.expect(res.success).to.be.equal(1)

    // unstub
    sinon.assert.calledOnce(coreUtils.text.checkXss)
    sinon.assert.calledOnce(User.utils.checkSameEmail)
    sinon.assert.calledOnce(User.utils.commonPassword)
    sinon.assert.calledOnce(User.utils.encryptPassword)
    sinon.assert.calledOnce(User.utils.getRole)
    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.assert.calledOnce(User.manager.instance.save)
    sinon.restore()
  })
});