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

describe('User.utils', function() {
  let fixture
  before( function() {
    config.users.enable = true
    fixture = {
      htmlIsAuthorized: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorized.html'), 'utf8'),
      htmlIsAuthorizedTrue: fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'themes', 'default', 'templates', 'isAuthorizedTrue.html'), 'utf8'),
      users: JSON.parse(fs.readFileSync(path.join(process.cwd(), 'tests', 'unit', 'fixtures', 'users', 'users.json'), 'utf8'))
    }
  });

  it('User.utils.getUserRoutes', function(){
    var role = User.utils.getUserRoutes("review")
    chai.expect(role).to.not.be.undefined
    chai.expect(role.length).to.above(0)
  })

  it('User.utils.findByUsername', function(done){
    var stub = sinon.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(fixture.users)))

    // test
    User.utils.findByUsername("test", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      // unstub
      sinon.assert.calledOnce(User.manager.instance.get)
      sinon.restore()
      done()
    })
  })

  it('User.utils.findByEmail', function(done){
    var stub = sinon.stub(User.manager.instance, 'get');
    stub.returns(JSON.parse(JSON.stringify(fixture.users)))

    // test
    User.utils.findByEmail("admin@test.com", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      // unstub
      sinon.assert.calledOnce(User.manager.instance.get)
      sinon.restore()
      done()
    })
  })

  it('User.utils.findByResetPasswordToken', function(done){
    // var stub = sinon.stub(User.manager.instance, 'get');
    // stub.returns(JSON.parse(JSON.stringify(fixture.users)))

    // test
    User.utils.findByResetPasswordToken("token", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      //unstub
      sinon.assert.calledOnce(User.manager.instance.get)
      sinon.restore()
      done()
    })
  })

  it('User.utils.decodeUser', function(){
    // sub
    var stubGetTokenFromCookies = sinon.stub(User.utils, 'getTokenFromCookies');
    stubGetTokenFromCookies.returns("test")
    var stubJwt = sinon.stub(jwt, 'decode');
    stubJwt.returns(JSON.parse(JSON.stringify(fixture.users))[0])

    var user = User.utils.decodeUser(1)
    chai.expect(user.id).to.not.be.null

    sinon.assert.calledOnce(User.utils.getTokenFromCookies)
    sinon.assert.calledOnce(jwt.decode)
    sinon.restore()
  })

  it('User.utils.getAll', function(){
    var stubGet = sinon.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(fixture.users)))

    var bdd = User.utils.getAll()
    chai.expect(bdd).to.not.be.undefined
    chai.expect(bdd[0].username).to.equal('test')

    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.restore()
  })

  it('User.utils.isValid', function(){
    var stubHashSync = sinon.stub(bcrypt, 'compareSync');
    stubHashSync.returns(true);

    // test
    var res = User.utils.isValid(JSON.parse(JSON.stringify(fixture.users))[0])
    chai.expect(res).to.be.equal(true)

    // unstub
    sinon.assert.calledOnce(bcrypt.compareSync)
    sinon.restore()
  })

  it('User.utils.findSync', function(){
    var stubGet = sinon.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(fixture.users)))

    // test
    var user = User.utils.findSync(1)
    chai.expect(user).to.not.be.undefined
    chai.expect(user.username).to.equal('test')

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.restore()
  })

  it('User.utils.find', function(done){
    var stubGet = sinon.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(fixture.users)))

    // test
    var user = User.utils.find(1, function (err, user) {
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      // unstub
      sinon.assert.calledOnce(User.manager.instance.get)
      sinon.restore()
      done()
    })
  })

  it('User.utils.checkSameEmail', function(){
    var stubGet = sinon.stub(User.manager.instance, 'get');
    stubGet.returns(JSON.parse(JSON.stringify(fixture.users)))

    // test
    var user = JSON.parse(JSON.stringify(fixture.users))[0]
    user.id = 2
    var res = User.utils.checkSameEmail(user)
    chai.expect(res.success).to.equal(0)

    // unstub
    sinon.assert.calledOnce(User.manager.instance.get)
    sinon.restore()
  })

  it('User.utils.getRole', function(){

    // test
    var user = JSON.parse(JSON.stringify(fixture.users))[0]
    user.role = "admin"
    var res = User.utils.getRole(JSON.parse(JSON.stringify(fixture.users))[0])
    chai.expect(res.role).to.not.be.equal("admin")
  })

  it('User.utils.commonPassword', function(){

    // test
    var user = JSON.parse(JSON.stringify(fixture.users))[0]
    user.password = "password"
    var res = User.utils.commonPassword(user)
    chai.expect(res.success).to.be.equal(0)
  })

  it('User.utils.encryptPassword', function(){
    var stubGenSaltSync = sinon.stub(bcrypt, 'genSaltSync');
    stubGenSaltSync.returns(10)
    var stubHashSync = sinon.stub(bcrypt, 'hashSync');
    stubHashSync.returns("test2")

    // test
    var user = JSON.parse(JSON.stringify(fixture.users))[0]
    user.password = "password"
    var res = User.utils.encryptPassword(10, "test")
    chai.expect(res).to.not.be.equal("test")

    // unstub
    sinon.assert.calledOnce(bcrypt.genSaltSync)
    sinon.assert.calledOnce(bcrypt.hashSync)
    sinon.restore()
  })

  it('User.utils.isUserAllowedOnRoute', function(){

    // test
    var user = JSON.parse(JSON.stringify(fixture.users))[0]
    var res = User.utils.isUserAllowedOnRoute("admin", "/abe/test")
    chai.expect(res).to.be.equal(true)

    var res = User.utils.isUserAllowedOnRoute("review", "/abe/truc")
    chai.expect(res).to.be.equal(false)

  })

  it('User.utils.getUserWorkflow', function(){

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

    // test
    var res = User.utils.loginLimitTry()
      .then(function () {
        done()
      })

    // unstub
  })
});