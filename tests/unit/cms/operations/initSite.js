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
    // stub
    var s = sinon.sandbox.create();
    const create = new cmsOperations.initSite()
    const stubadd = s.stub(create, 'addFolder', function () {
      return Promise.resolve()
    }.bind(this));

    create.init(process.cwd())
      .then(function(resSave) {
        
        sinon.assert.callCount(stubadd, 7)
        stubadd.restore()

        done()
      }.bind(this));
  });

  it('cmsOperations.initSite updateSecurity()', function(done) {
    // stub
    const s = sinon.sandbox.create();
    const create = new cmsOperations.initSite()
    const stubConf = s.stub(config, 'save', function (p) { return p; }.bind(this));
    const stubRead = s.stub(User.manager.instance, 'read');
    const stubUpdate = s.stub(User.manager.instance, 'update');
    const uadd = s.stub(User.operations, 'add')
    const uactivate = s.stub(User.operations, 'activate')
    uadd.returns({user:{id:1}})
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

        stubConf.restore()
        uadd.restore()
        uactivate.restore()
        stubRead.restore()
        stubUpdate.restore()
        done()
      }.bind(this));
  });
});
