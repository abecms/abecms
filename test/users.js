var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var bcrypt = require('bcrypt-nodejs');
// var child_process = require('child_process')
// import {Promise} from 'bluebird'
// var events = require('events')
// import which from 'which'
// const npm = which.sync('npm')

var config = require('../src/cli').config
config.set({root: path.join(__dirname,'fixtures')})

var User = require('../src/cli').User;
var fse = require('fs-extra');

describe('users', function() {
  before( function() {
    config.users.enable = true
    this.fixture = {
      users: JSON.parse(fse.readFileSync(__dirname + '/fixtures/users/users.json', 'utf8')),
    }
  });

  it('User.getUserRoutes', function(){
    var sinonInstance = sinon.sandbox.create();
    var role = User.getUserRoutes("review")
    chai.expect(role).to.not.be.undefined
    chai.expect(role.length).to.above(0)
  })

  it('User.findByUsername', function(done){
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User, 'getBdd');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    User.findByUsername("test", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')
      sinon.assert.calledOnce(User.getBdd)
      User.getBdd.restore()
      done()
    })
  })

  it('User.findByEmail', function(done){
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User, 'getBdd');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    User.findByEmail("admin@test.com", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')
      sinon.assert.calledOnce(User.getBdd)
      User.getBdd.restore()
      done()
    })
  })

  it('User.findByResetPasswordToken', function(done){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User, 'getBdd');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))

    // test
    User.findByResetPasswordToken("token", function (err, user) {
      chai.expect(err).to.be.null
      chai.expect(user).to.not.be.undefined
      chai.expect(user.username).to.equal('test')

      //unstub
      sinon.assert.calledOnce(User.getBdd)
      User.getBdd.restore()
      done()
    })
  })

  it('User.deactivate', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User, 'getBdd');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubWriteBddFile = sinonInstance.stub(User, 'writeBddFile');
    stubWriteBddFile.returns(null);

    // test
    var bdd = User.deactivate(1)
    chai.expect(bdd[0].actif).to.equal(0)

    // unstub
    sinon.assert.calledOnce(User.getBdd)
    User.getBdd.restore()
    sinon.assert.calledOnce(User.writeBddFile)
    User.writeBddFile.restore()
  })

  it('User.activate', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User, 'getBdd');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubWriteBddFile = sinonInstance.stub(User, 'writeBddFile');
    stubWriteBddFile.returns(null);

    // test
    var bdd = User.activate(1)
    chai.expect(bdd[0].actif).to.equal(1)

    // unstub
    sinon.assert.calledOnce(User.getBdd)
    User.getBdd.restore()
    sinon.assert.calledOnce(User.writeBddFile)
    User.writeBddFile.restore()
  })

  it('User.remove', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User, 'getBdd');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var stubWriteBddFile = sinonInstance.stub(User, 'writeBddFile');
    stubWriteBddFile.returns(null);

    // test
    var bdd = User.remove(1)
    chai.expect(bdd.length).to.equal(0)

    // unstub
    sinon.assert.calledOnce(User.getBdd)
    User.getBdd.restore()
    sinon.assert.calledOnce(User.writeBddFile)
    User.writeBddFile.restore()
  })

  // it('User.decodeUser', function(){
  //   var sinonInstance = sinon.sandbox.create();
  //   var stub = sinonInstance.stub(User, 'getBdd');
  //   stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
  //   var bdd = User.decodeUser(1)
  //   chai.expect(bdd.length).to.equal(0)
  //   sinon.assert.calledOnce(User.getBdd)
  //   User.getBdd.restore()
  // })

  it('User.update', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubTextXss = sinonInstance.stub(User, 'textXss');
    stubTextXss.returns({ success:1 });
    var stubCheckSameEmail = sinonInstance.stub(User, 'checkSameEmail');
    stubCheckSameEmail.returns({ success:1 });
    var stubGetBdd = sinonInstance.stub(User, 'getBdd');
    stubGetBdd.returns(JSON.parse(JSON.stringify(this.fixture.users)));
    var stubWriteBddFile = sinonInstance.stub(User, 'writeBddFile');
    stubWriteBddFile.returns(null);

    var bdd = User.update({id: 2})
    chai.expect(bdd.user.id).to.be.equal(2)

    // unstub
    sinon.assert.calledOnce(User.textXss)
    User.textXss.restore()
    sinon.assert.calledOnce(User.checkSameEmail)
    User.checkSameEmail.restore()
    sinon.assert.calledOnce(User.getBdd)
    User.getBdd.restore()
    sinon.assert.calledOnce(User.writeBddFile)
    User.writeBddFile.restore()
  })

  it('User.updatePassword', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubCommonPassword = sinonInstance.stub(User, 'commonPassword');
    stubCommonPassword.returns({ success:1 });
    var stubGetBdd = sinonInstance.stub(User, 'getBdd');
    stubGetBdd.returns(JSON.parse(JSON.stringify(this.fixture.users)));
    var stubWriteBddFile = sinonInstance.stub(User, 'writeBddFile');
    stubWriteBddFile.returns(null);

    // test
    var oldPassword = JSON.parse(JSON.stringify(this.fixture.users)).password
    var bdd = User.updatePassword(JSON.parse(JSON.stringify(this.fixture.users)), "newPassword")
    chai.expect(bdd.user[0].password).to.not.be.equal(oldPassword)

    // unstub
    sinon.assert.calledOnce(User.commonPassword)
    User.commonPassword.restore()
    sinon.assert.calledOnce(User.getBdd)
    User.getBdd.restore()
    sinon.assert.calledOnce(User.writeBddFile)
    User.writeBddFile.restore()
  })

  it('User.add', function(){
    // stub
    var sinonInstance = sinon.sandbox.create();
    var stubTextXss = sinonInstance.stub(User, 'textXss');
    stubTextXss.returns({ success:1 });
    var stubCheckSameEmail = sinonInstance.stub(User, 'checkSameEmail');
    stubCheckSameEmail.returns({ success:1 });
    var stubCommonPassword = sinonInstance.stub(User, 'commonPassword');
    stubCommonPassword.returns({ success:1 });
    var stubGetBdd = sinonInstance.stub(User, 'getBdd');
    stubGetBdd.returns(JSON.parse(JSON.stringify(this.fixture.users)));
    var stubWriteBddFile = sinonInstance.stub(User, 'writeBddFile');
    stubWriteBddFile.returns(null);
    var stubGenSaltSync = sinonInstance.stub(bcrypt, 'genSaltSync');
    stubGenSaltSync.returns(null);
    var stubHashSync = sinonInstance.stub(bcrypt, 'hashSync');
    stubHashSync.returns("pwd");
    
    // test
    var res = User.add(JSON.parse(JSON.stringify(this.fixture.users))[0])
    chai.expect(res.success).to.be.equal(1)

    // unstub
    sinon.assert.calledOnce(User.textXss)
    User.textXss.restore()
    sinon.assert.calledOnce(User.checkSameEmail)
    User.checkSameEmail.restore()
    sinon.assert.calledOnce(User.commonPassword)
    User.commonPassword.restore()
    sinon.assert.calledOnce(User.getBdd)
    User.getBdd.restore()
    sinon.assert.calledOnce(User.writeBddFile)
    User.writeBddFile.restore()
    sinon.assert.calledOnce(bcrypt.genSaltSync)
    bcrypt.genSaltSync.restore()
    sinon.assert.calledOnce(bcrypt.hashSync)
    bcrypt.hashSync.restore()
  })

  it('User.getAll', function(){
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User, 'getBdd');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var bdd = User.getAll()
    chai.expect(bdd).to.not.be.undefined
    chai.expect(bdd[0].username).to.equal('test')
    sinon.assert.calledOnce(User.getBdd)
    User.getBdd.restore()
  })

  it('User.findSync', function(){
    var sinonInstance = sinon.sandbox.create();
    var stub = sinonInstance.stub(User, 'getBdd');
    stub.returns(JSON.parse(JSON.stringify(this.fixture.users)))
    var user = User.findSync(1)
    chai.expect(user).to.not.be.undefined
    chai.expect(user.username).to.equal('test')
    sinon.assert.calledOnce(User.getBdd)
    User.getBdd.restore()
  })
});