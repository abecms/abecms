var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

var abeExtend = require('../../../../src/cli').abeExtend
var cmsData = require('../../../../src/cli').cmsData
var Manager = require('../../../../src/cli').Manager
var coreUtils = require('../../../../src/cli').coreUtils
var cmsOperations = require('../../../../src/cli').cmsOperations
var cmsTemplates = require('../../../../src/cli').cmsTemplates
var Manager = require('../../../../src/cli').Manager;
var Page = require('../../../../src/cli').Page;
var User = require('../../../../src/cli').User;

describe('cmsOperations', function() {

  it('cmsOperations.initSite()', function(done) {
    const create = new cmsOperations.initSite()
    const uadd = sinon.stub(User.operations, 'add')
    uadd.returns({success: 1, user:{id:1}})
    const chdir = sinon.stub(process, 'chdir');
    const stubadd = sinon.stub(create, 'addFolder').callsFake( () => {
      return Promise.resolve()
    })

    create.init(process.cwd())
      .then(function(resSave) {

        sinon.assert.callCount(stubadd, 7)
        sinon.assert.callCount(chdir, 1)
        stubadd.restore()
        chdir.restore()
        uadd.restore()

        done()
      }.bind(this));
  });

  it('cmsOperations.initSite updateSecurity()', function(done) {
    const create = new cmsOperations.initSite()
    const stubConf = sinon.stub(config, 'save').callsFake( (p) => {
      return p;
    })
    const stubRead = sinon.stub(User.manager.instance, 'read')
    const stubUpdate = sinon.stub(User.manager.instance, 'update')
    const uadd = sinon.stub(User.operations, 'add')
    const uactivate = sinon.stub(User.operations, 'activate')
    uadd.returns({success:1,user:{id:1}})
    uactivate.returns(true)
    stubRead.returns({})
    stubUpdate.returns(true)

    const u = {
      'username': 'nametest',
      'name': 'nametest',
      'email': 'email',
      'password': 'password',
      'role': {
        'workflow':'admin',
        'name':'Admin'
      }
    }

    create.updateSecurity({security:true, username:'nametest', email:'email', password:'password'})
      .then(function(resSave) {

        sinon.assert.callCount(stubConf, 1)
        uadd.calledWith(u)
        sinon.assert.callCount(uadd, 1)
        sinon.assert.callCount(uactivate, 1)

        sinon.restore()
        done()
      }.bind(this));
  });
});
