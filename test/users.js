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
var Handlebars =require('../src/cli').Handlebars

var coreUtils = require('../src/cli').coreUtils
var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var User = require('../src/cli').User;

describe('users', function() {
  before( function() {
    config.users.enable = true
    this.fixture = {
      htmlIsAuthorized: fs.readFileSync(path.join(__dirname, 'fixtures', 'templates', 'isAuthorized.html'), 'utf8'),
      htmlIsAuthorizedTrue: fs.readFileSync(path.join(__dirname, 'fixtures', 'templates', 'isAuthorizedTrue.html'), 'utf8'),
      users: JSON.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'users', 'users.json'), 'utf8'))
    }
  });

  it('Handlebars.helpers.isAuthorized', function() {
    var template = Handlebars.compile(this.fixture.htmlIsAuthorized)
    var resHtml = template({})
    chai.expect(resHtml).to.be.equal("");

    template = Handlebars.compile(this.fixture.htmlIsAuthorizedTrue)
    resHtml = template({})
    chai.expect(resHtml).to.not.be.equal("");
  });

  it('User.utils.getUserRoutes', function(){
    var sinonInstance = sinon.sandbox.create();
    var role = User.utils.getUserRoutes("review")
    chai.expect(role).to.not.be.undefined
    chai.expect(role.length).to.above(0)
  })

  it('User.utils.findByUsername', function(done){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    User.utils.findByUsername("test", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      // unstub
      sinon.assert.calledOnce(User.manager.instance.get)
      User.manager.instance.get.restore()
      done()
    })
  })

  it('User.utils.findByEmail', function(done){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    User.utils.findByEmail("admin@test.com", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      // unstub
      sinon.assert.calledOnce(User.manager.instance.get)
      User.manager.instance.get.restore()
      done()
    })
  })

  it('User.utils.findByResetPasswordToken', function(done){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    User.utils.findByResetPasswordToken("token", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      //unstub
      sinon.assert.calledOnce(User.manager.instance.get)
      User.manager.instance.get.restore()
      done()
    })
  })

  it('User.operations.deactivate', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubSave = sinonInstance.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var bdd = User.operations.deactivate(1)
    chai.expect(bdd[0].actif).to.equal(0)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
    sinon.assert.calledOnce(User.manager.instance.save)
    User.manager.instance.save.restore()
  })

  it('User.operations.activate', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubSave = sinonInstance.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var bdd = User.operations.activate(1)
    chai.expect(bdd[0].actif).to.equal(1)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
    sinon.assert.calledOnce(User.manager.instance.save)
    User.manager.instance.save.restore()
  })

  it('User.operations.remove', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubSave = sinonInstance.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var bdd = User.operations.remove(1)
    chai.expect(bdd.length).to.equal(0)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
    sinon.assert.calledOnce(User.manager.instance.save)
    User.manager.instance.save.restore()
  })

  it('User.utils.decodeUser', function(){
    // sub
    var sinonInstance = sinon.sandbox.create();
    var stubGetTokenFromCookies = sinonInstance.stub(User.utils, 'getTokenFromCookies');
    stubGetTokenFromCookies.returns("test")
    var stubJwt = sinonInstance.stub(jwt, 'decode');
    stubJwt.returns(JSON.parse(JSON.stringify(this.fixture.users))[0])

    var user = User.utils.decodeUser(1)
    chai.expect(user.id).to.not.be.null

    sinon.assert.calledOnce(User.utils.getTokenFromCookies)
    User.utils.getTokenFromCookies.restore()
    sinon.assert.calledOnce(jwt.decode)
    jwt.decode.restore()
  })

  it('User.operations.update', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubTextXss = sinonInstance.stub(coreUtils.text, 'checkXss');
    stubTextXss.returns({ success:1 });
    var stubCheckSameEmail = sinonInstance.stub(User.utils, 'checkSameEmail');
    stubCheckSameEmail.returns({ success:1 });
    var stubGetRole = sinonInstance.stub(User.utils, 'getRole');
    stubGetRole.returns(JSON.parse(JSON.stringify(this.fixture.users))[0].role);
    var stubGet = sinonInstance.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubSave = sinonInstance.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var bdd = User.operations.update({id: 2})
    chai.expect(bdd.user.id).to.be.equal(2)

    // unstub
    sinon.assert.calledOnce(coreUtils.text.checkXss)
    coreUtils.text.checkXss.restore()
    sinon.assert.calledOnce(User.utils.checkSameEmail)
    User.utils.checkSameEmail.restore()
    sinon.assert.calledOnce(User.utils.getRole)
    User.utils.getRole.restore()
    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
    sinon.assert.calledOnce(User.manager.instance.save)
    User.manager.instance.save.restore()
  })

  it('User.operations.updatePassword', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubCommonPassword = sinonInstance.stub(User.utils, 'commonPassword');
    stubCommonPassword.returns({ success:1 });
    var stubEncryptPassword = sinonInstance.stub(User.utils, 'encryptPassword');
    stubEncryptPassword.returns("newPassword2");
    var stubGet = sinonInstance.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubSave = sinonInstance.stub(User.manager.instance, 'save');
    stubSave.returns(null)

    // test
    var oldPassword = JSON.parse(JSON.stringify(this.fixture.users)).password
    var bdd = User.operations.updatePassword(JSON.parse(JSON.stringify(this.fixture.users))[0], "newPassword")
    chai.expect(bdd.user.password).to.not.be.equal(oldPassword)

    // unstub
    sinon.assert.calledOnce(User.utils.commonPassword)
    User.utils.commonPassword.restore()
    sinon.assert.calledOnce(User.utils.encryptPassword)
    User.utils.encryptPassword.restore()
    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
    sinon.assert.calledOnce(User.manager.instance.save)
    User.manager.instance.save.restore()
  })

  it('User.operations.add', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubTextXss = sinonInstance.stub(coreUtils.text, 'checkXss');
    stubTextXss.returns({ success:1 });
    var stubCheckSameEmail = sinonInstance.stub(User.utils, 'checkSameEmail');
    stubCheckSameEmail.returns({ success:1 });
    var stubCommonPassword = sinonInstance.stub(User.utils, 'commonPassword');
    stubCommonPassword.returns({ success:1 });
    var stubEncryptPassword = sinonInstance.stub(User.utils, 'encryptPassword');
    stubEncryptPassword.returns("newPassword2");
    var stubGetRole = sinonInstance.stub(User.utils, 'getRole');
    stubGetRole.returns(JSON.parse(JSON.stringify(this.fixture.users))[0].role);
    var stubGet = sinonInstance.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubSave = sinonInstance.stub(User.manager.instance, 'save');
    stubSave.returns(null)
    
    // test
    var res = User.operations.add(JSON.parse(JSON.stringify(this.fixture.users))[0])
    chai.expect(res.success).to.be.equal(1)

    // unstub
    sinon.assert.calledOnce(coreUtils.text.checkXss)
    coreUtils.text.checkXss.restore()
    sinon.assert.calledOnce(User.utils.checkSameEmail)
    User.utils.checkSameEmail.restore()
    sinon.assert.calledOnce(User.utils.commonPassword)
    User.utils.commonPassword.restore()
    sinon.assert.calledOnce(User.utils.encryptPassword)
    User.utils.encryptPassword.restore()
    sinon.assert.calledOnce(User.utils.getRole)
    User.utils.getRole.restore()
    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
    sinon.assert.calledOnce(User.manager.instance.save)
    User.manager.instance.save.restore()
  })

  it('User.utils.getAll', function(){
    var sinonInstance = sinon.sandbox.create();
    var stubGet = sinonInstance.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    var bdd = User.utils.getAll()
    chai.expect(bdd).to.not.be.undefined
    chai.expect(bdd[0].username).to.equal('test')

    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
  })

  it('User.utils.isValid', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubHashSync = sinonInstance.stub(bcrypt, 'compareSync');
    stubHashSync.returns(true);

    // test
    var res = User.utils.isValid(JSON.parse(JSON.stringify(this.fixture.users))[0])
    chai.expect(res).to.be.equal(true)

    // unstub
    sinon.assert.calledOnce(bcrypt.compareSync)
    bcrypt.compareSync.restore()
  })

  it('User.utils.findSync', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubGet = sinonInstance.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    var user = User.utils.findSync(1)
    chai.expect(user).to.not.be.undefined
    chai.expect(user.username).to.equal('test')

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
  })

  it('User.utils.find', function(done){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubGet = sinonInstance.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    var user = User.utils.find(1, function (err, user) {
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      // unstub
      sinon.assert.calledOnce(User.manager.instance.get)
      User.manager.instance.get.restore()
      done()
    })
  })

  it('User.utils.checkSameEmail', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubGet = sinonInstance.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    var user = JSON.parse(JSON.stringify(this.fixture.users))[0]
    user.id = 2
    var res = User.utils.checkSameEmail(user)
    chai.expect(res.success).to.equal(0)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    User.manager.instance.get.restore()
  })

  it('User.utils.getRole', function(){
    // stub

    // test
    var user = JSON.parse(JSON.stringify(this.fixture.users))[0]
    user.role = "admin"
    var res = User.utils.getRole(JSON.parse(JSON.stringify(this.fixture.users))[0])
    chai.expect(res.role).to.not.be.equal("admin")

    // unstub
  })

  it('User.utils.commonPassword', function(){
    // stub

    // test
    var user = JSON.parse(JSON.stringify(this.fixture.users))[0]
    user.password = "password"
    var res = User.utils.commonPassword(user)
    chai.expect(res.success).to.be.equal(0)

    // unstub
  })

  it('User.utils.encryptPassword', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubGenSaltSync = sinonInstance.stub(bcrypt, 'genSaltSync');
    stubGenSaltSync.returns(10)
    var stubHashSync = sinonInstance.stub(bcrypt, 'hashSync');
    stubHashSync.returns("test2")

    // test
    var user = JSON.parse(JSON.stringify(this.fixture.users))[0]
    user.password = "password"
    var res = User.utils.encryptPassword(10, "test")
    chai.expect(res).to.not.be.equal("test")

    // unstub
    sinon.assert.calledOnce(bcrypt.genSaltSync)
    bcrypt.genSaltSync.restore()
    sinon.assert.calledOnce(bcrypt.hashSync)
    bcrypt.hashSync.restore()
  })

  it('User.utils.isUserAllowedOnRoute', function(){
    // stub

    // test
    var user = JSON.parse(JSON.stringify(this.fixture.users))[0]
    var res = User.utils.isUserAllowedOnRoute("admin", "/abe/test")
    chai.expect(res).to.be.equal(true)

    var res = User.utils.isUserAllowedOnRoute("review", "/abe/truc")
    chai.expect(res).to.be.equal(false)

    // unstub
  })

  it('User.manager.instance.get', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubRead = sinonInstance.stub(User.manager.instance, 'read');
    stubRead.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    var res = User.manager.instance.get()
    chai.expect(res.length).to.be.above(0)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.read)
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