var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../src/cli').config
config.set({root: path.join(process.cwd(), 'test', 'fixtures')})

var cmsEditor = require('../../../src/cli').cmsEditor;
var Manager = require('../../../src/cli').Manager;

describe('Form', function() {
  before( function(done) {
    Manager.instance.init()
      .then(function () {
        this.fixture = {}
        done()
        
      }.bind(this))
  });

  /**
   * getTemplatesTexts
   * 
   */
  it('new Form', function() {
    // stub
    var sinonInstance = sinon.sandbox.create();
    // sinonInstance.stub(fse, 'readFileSync');
    
    var form = new cmsEditor.form()
    form.add({key: 'test'})
    chai.expect(form._form.default.item[0].key).to.be.equal('test');
    chai.expect(form.dontHaveKey('test')).to.be.equal(false);
    chai.expect(form.form.default.item.length).to.be.above(0);
  });
});
