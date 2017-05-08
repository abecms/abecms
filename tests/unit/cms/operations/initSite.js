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
});
