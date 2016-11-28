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
var Handlebars =require('../../src/cli').Handlebars

var coreUtils = require('../../src/cli').coreUtils
var config = require('../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var User = require('../../src/cli').User;

describe('User.utils', function() {
  before( function() {
    config.users.enable = true
    this.fixture = {
      htmlIsAuthorized: fs.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'isAuthorized.html'), 'utf8'),
      htmlIsAuthorizedTrue: fs.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'templates', 'isAuthorizedTrue.html'), 'utf8'),
      users: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'test', 'fixtures', 'users', 'users.json'), 'utf8'))
    }
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

  it('User.utils.getUserWorkflow', function(){
    // stub

    // test
    config.users.enable = false
    var res = User.utils.getUserWorkflow()
    chai.expect(res.length).to.be.equal(2)

    config.users.enable = true
    var res = User.utils.getUserWorkflow("draft", "admin")
    chai.expect(res.length).to.be.equal(2)
    // unstub
  })

  it('User.utils.loginLimitTry', function(done){
    // stub

    // test
    var res = User.utils.loginLimitTry()
      .then(function () {
        done()
      })

    // unstub
  })
});