var chai = require('chai');
var sinonChai = require('sinon-chai')
var expect = chai.expect
chai.use(sinonChai)
var sinon = require('sinon');
var path = require('path');
var fse = require('fs-extra');

var config = require('../../../../src/cli').config
config.set({root: path.join(process.cwd(), 'tests', 'unit', 'fixtures')})

import data from '../../fixtures/editor/add.json'
var cmsEditor = require('../../../../src/cli').cmsEditor;
var Manager = require('../../../../src/cli').Manager;

describe('editor', function() {
  before( function(done) {
        done()
        
  });

  /**
   * editor.add
   * 
   */
  it('editor.add', function() {
    var result = cmsEditor.editor.add(
      data.obj,
      data.json,
      {add:function () {}}
    )

    chai.expect(result).to.be.a('string');
    chai.expect(result).to.be.equal('some text');
  });

  /**
   * editor.add 2
   * 
   */
  it('editor.add 2', function() {
    var obj = {'key':'test[0]', 'value':'done'}
    var json = {'key':'test'}
    var form = new cmsEditor.form()
    var result = cmsEditor.editor.add(
      obj,
      json,
      form
    )

    chai.expect(result).to.be.a('string');
    chai.expect(result).to.be.equal('done');
  });
});
